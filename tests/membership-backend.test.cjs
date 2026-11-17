const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const vm = require("node:vm");
const code = readFileSync(
  resolve(__dirname, "../google-apps-script/Code.gs"),
  "utf8",
);
const headers = [
  "id",
  "createdAt",
  "name",
  "email",
  "phone",
  "publicConsent",
  "welcomeEmailStatus",
  "welcomeEmailSentAt",
  "photoUrl",
];

const backend = (initialRows = [headers], options = {}) => {
  const rows = initialRows.map((row) => [...row]);
  let sheetExists = options.sheetExists !== false;
  const operations = {
    sheetCreations: 0,
    headerWrites: 0,
    columnExpansions: 0,
    readRanges: [],
    fullDataReads: 0,
    welcomeEmails: [],
  };
  let maximumWidth = Math.max(1, ...rows.map((row) => row.length));
  const sheet = {
    getMaxColumns: () => maximumWidth,
    insertColumnsAfter: (after, count) => {
      assert.equal(after, maximumWidth);
      maximumWidth += count;
      operations.columnExpansions++;
    },
    getLastRow: () => rows.length,
    getLastColumn: () => Math.max(0, ...rows.map((row) => row.length)),
    getRange: (r, c, h, w) => ({
      getValues: () => {
        operations.readRanges.push({ row: r, column: c, height: h, width: w });
        return Array.from({ length: h }, (_, i) =>
          Array.from(
            { length: w },
            (_, j) => rows[r + i - 1]?.[c + j - 1] ?? "",
          ),
        );
      },
      setValues: (values) => {
        assert.ok(c + w - 1 <= maximumWidth);
        if (r === 1) operations.headerWrites++;
        values.forEach((row, i) => {
          rows[r + i - 1] ??= [];
          row.forEach((v, j) => {
            rows[r + i - 1][c + j - 1] = v;
          });
        });
      },
    }),
    getDataRange: () => ({
      getValues: () => {
        operations.fullDataReads++;
        return rows.map((row) => [...row]);
      },
    }),
    setFrozenRows: () => {},
    appendRow: (row) => rows.push([...row]),
  };
  const properties =
    options.savedId === null
      ? {}
      : { SPREADSHEET_ID: options.savedId || "test-sheet" };
  const spreadsheet = {
    getId: () => "bound-sheet",
    getSheetByName: () => (sheetExists ? sheet : null),
    insertSheet: () => {
      sheetExists = true;
      operations.sheetCreations++;
      return sheet;
    },
  };
  let activeSpreadsheet = options.activeSpreadsheet ? spreadsheet : null;
  const context = vm.createContext({
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (text) => ({
        text,
        setMimeType() {
          return this;
        },
      }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => properties[key] ?? null,
        setProperty: (key, value) => {
          properties[key] = value;
        },
      }),
    },
    SpreadsheetApp: {
      openById: (id) => {
        operations.lastOpenedId = id;
        return spreadsheet;
      },
      getActiveSpreadsheet: () => activeSpreadsheet,
      flush: () => {},
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => true,
        waitLock: () => {},
        releaseLock: () => {},
      }),
    },
    Utilities: { getUuid: () => `member-${rows.length}` },
    MailApp: {
      sendEmail: (message) => operations.welcomeEmails.push(message),
    },
  });
  vm.runInContext(code, context);
  const post = (data) =>
    JSON.parse(
      context.doPost({ postData: { contents: JSON.stringify(data) } }).text,
    );
  const get = () =>
    JSON.parse(context.doGet({ parameter: { action: "members" } }).text);
  return {
    context,
    rows,
    post,
    get,
    operations,
    properties,
    clearActiveSpreadsheet: () => {
      activeSpreadsheet = null;
    },
  };
};
const applicant = {
  name: "Private Test Person",
  email: "private@example.com",
  phone: "9876543210",
  publicConsent: false,
};

test("No stores consent and increases the count without exposing any profile or contact details", () => {
  const api = backend();
  assert.equal(api.post(applicant).success, true);
  assert.equal(api.operations.welcomeEmails.length, 1);
  assert.equal(api.operations.welcomeEmails[0].to, applicant.email);
  assert.equal(api.rows[1][5], false);
  assert.deepEqual(api.get(), { success: true, totalCount: 1, members: [] });
  assert.ok(!JSON.stringify(api.get()).includes(applicant.name));
});

test("Only explicit consent publishes profiles; all members are counted", () => {
  const api = backend([
    headers,
    [
      "1",
      "",
      "Public Alice",
      "alice@example.com",
      "1111111111",
      true,
      "https://example.com/alice.jpg",
    ],
    [
      "2",
      "",
      "Private Bob",
      "bob@example.com",
      "2222222222",
      false,
      "https://example.com/bob.jpg",
    ],
    ["3", "", "Legacy Cara", "cara@example.com", "3333333333", "", ""],
    ["4", "", "Unclear Dan", "dan@example.com", "4444444444", "maybe", ""],
    ["5", "", "Public Eve", "eve@example.com", "5555555555", "YES", ""],
    ["6", "", "Private Fred", "fred@example.com", "6666666666", "no", ""],
    ["", "", "", "", "", "", ""],
  ]);
  const result = api.get();
  assert.equal(result.totalCount, 6);
  assert.deepEqual(
    result.members.map((m) => m.name),
    ["Public Alice", "Public Eve"],
  );
  for (const member of result.members)
    assert.deepEqual(Object.keys(member), ["name"]);
  assert.ok(!JSON.stringify(result).includes("@example.com"));
  assert.ok(!JSON.stringify(result).includes("Private Bob"));
  assert.ok(
    !JSON.stringify(result).includes("https://"),
    "Legacy photo URLs must not be returned",
  );
});

test("Existing rows with no consent column remain private", () => {
  const api = backend([
    ["Full name", "Email address", "Phone number"],
    ["Legacy Member", "legacy@example.com", "9876543210"],
  ]);
  assert.deepEqual(api.get(), { success: true, totalCount: 1, members: [] });
  assert.equal(
    api.post({
      ...applicant,
      name: "New Public Member",
      email: "new@example.com",
      publicConsent: true,
    }).success,
    true,
  );
  const result = api.get();
  assert.equal(result.totalCount, 2);
  assert.deepEqual(
    result.members.map((m) => m.name),
    ["New Public Member"],
  );
  assert.equal(api.rows[1][0], "Legacy Member");
});

test("Consent must be an explicit boolean before saving", () => {
  const api = backend();
  for (const publicConsent of [undefined, null, "yes", "no", 1]) {
    assert.equal(api.post({ ...applicant, publicConsent }).success, false);
  }
  assert.equal(api.rows.length, 1);
  assert.equal(api.post({ ...applicant, publicConsent: true }).success, true);
  assert.deepEqual(api.get().members, [{ name: applicant.name }]);
});

test("A duplicate request cannot change a private member to public", () => {
  const api = backend();
  assert.equal(api.post(applicant).success, true);
  assert.equal(api.post({ ...applicant, publicConsent: true }).success, false);
  assert.equal(api.operations.welcomeEmails.length, 1);
  assert.equal(api.rows.length, 2);
  assert.equal(api.get().totalCount, 1);
  assert.deepEqual(api.get().members, []);
});

test("Withdrawing consent hides the name while retaining the total", () => {
  const api = backend();
  api.post({ ...applicant, publicConsent: true });
  api.rows[1][6] = "https://example.com/profile.jpg";
  assert.equal(api.get().members.length, 1);
  api.rows[1][5] = false;
  assert.deepEqual(api.get(), { success: true, totalCount: 1, members: [] });
});

test("Invalid input is rejected and submitted spreadsheet formulas are escaped", () => {
  const api = backend();
  assert.equal(api.post({ ...applicant, name: " " }).success, false);
  assert.equal(api.post({ ...applicant, email: "invalid" }).success, false);
  assert.equal(api.post({ ...applicant, phone: "......." }).success, false);
  assert.equal(api.rows.length, 1);
  assert.equal(
    api.post({ ...applicant, name: '=IMPORTXML("x")' }).success,
    true,
  );
  assert.equal(api.rows[1][2], '\'=IMPORTXML("x")');
});

test("A directory read automatically creates a missing tab and all required columns", () => {
  const api = backend([], { sheetExists: false });
  assert.deepEqual(api.get(), { success: true, totalCount: 0, members: [] });
  assert.deepEqual(api.rows[0], [
    "id",
    "createdAt",
    "name",
    "email",
    "phone",
    "publicConsent",
    "welcomeEmailStatus",
    "welcomeEmailSentAt",
  ]);
  assert.equal(api.operations.sheetCreations, 1);
  assert.equal(api.operations.columnExpansions, 1);
  assert.equal(api.post(applicant).success, true);
  assert.equal(api.get().totalCount, 1);
});

test("Repeated reads and writes never duplicate or rewrite existing headers", () => {
  const api = backend([]);
  api.get();
  const firstHeaders = [...api.rows[0]];
  const writes = api.operations.headerWrites;
  for (let i = 0; i < 3; i++) api.get();
  api.post(applicant);
  api.get();
  assert.deepEqual(api.rows[0], firstHeaders);
  assert.equal(api.operations.headerWrites, writes);
});

test("Missing columns are recreated on the next read without changing existing rows", () => {
  const api = backend([
    ["Full name", "Email address", "Phone number", "Notes"],
    ["Existing member", "existing@example.com", "9876543210", "Keep this note"],
  ]);
  const original = [...api.rows[1]];
  assert.deepEqual(api.get(), { success: true, totalCount: 1, members: [] });
  assert.deepEqual(api.rows[1], original);
  assert.equal(api.rows[0][0], "Full name");
  assert.equal(api.rows[0][3], "Notes");
  assert.ok(api.rows[0].includes("publicConsent"));
  const consentIndex = api.rows[0].indexOf("publicConsent");
  api.rows.forEach((row) => row.splice(consentIndex, 1));
  api.get();
  assert.equal(
    api.rows[0].filter((name) => name === "publicConsent").length,
    1,
  );
  assert.deepEqual(api.rows[1], original);
  assert.deepEqual(api.get().members, []);
});

test("The first registration creates a missing sheet without manual setup", () => {
  const api = backend([], { sheetExists: false });
  assert.equal(api.post({ ...applicant, publicConsent: true }).success, true);
  assert.equal(api.operations.sheetCreations, 1);
  assert.equal(api.get().totalCount, 1);
  assert.equal(api.get().members[0].name, applicant.name);
});

test("Setup detects the bound spreadsheet ID and persists it for web requests", () => {
  const api = backend([], { savedId: null, activeSpreadsheet: true });
  api.context.setupMembersSheet();
  assert.equal(api.properties.SPREADSHEET_ID, "bound-sheet");
  api.clearActiveSpreadsheet();
  assert.equal(api.post(applicant).success, true);
  assert.equal(api.get().totalCount, 1);
  assert.equal(api.operations.lastOpenedId, "bound-sheet");
});

test("An explicit saved spreadsheet ID takes precedence over the active sheet", () => {
  const api = backend([], { savedId: "chosen-sheet", activeSpreadsheet: true });
  api.context.setupMembersSheet();
  assert.equal(api.operations.lastOpenedId, "chosen-sheet");
  assert.equal(api.properties.SPREADSHEET_ID, "chosen-sheet");
});

test("A web request without saved or active spreadsheet cannot choose an unrelated spreadsheet", () => {
  const api = backend([], { savedId: null });
  assert.throws(
    () => api.context.setupMembersSheet(),
    /run setupMembersSheet once/,
  );
  assert.equal(api.get().success, false);
  assert.equal(api.post(applicant).success, false);
  assert.equal(api.rows.length, 0);
  assert.equal(api.properties.SPREADSHEET_ID, undefined);
});

test("Public reads fetch only names and consent, returning names and total count only", () => {
  const api = backend([
    headers,
    [
      "secret-id",
      "private-date",
      "Public Name",
      "secret@example.com",
      "9999999999",
      true,
      "private-photo",
    ],
  ]);
  assert.deepEqual(api.get(), {
    success: true,
    totalCount: 1,
    members: [{ name: "Public Name" }],
  });
  assert.equal(api.operations.fullDataReads, 0);
  const detailReads = api.operations.readRanges.filter(
    (range) => range.row > 1,
  );
  assert.deepEqual(
    detailReads.map((range) => range.column),
    [3, 6],
  );
  assert.ok(detailReads.every((range) => range.width === 1));
});
