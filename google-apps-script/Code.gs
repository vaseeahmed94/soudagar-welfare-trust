/**
 * SWT membership backend. Install in Google Apps Script with the V8 runtime.
 * SPREADSHEET_ID is captured automatically when run from the bound sheet.
 * Script properties: MEMBER_SHEET_NAME (optional), SPREADSHEET_ID (override).
 * See google-apps-script/README.md for setup and deployment.
 */
const MEMBER_COLUMNS = [
  "id",
  "createdAt",
  "name",
  "email",
  "phone",
  "publicConsent",
];

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function spreadsheet_() {
  const properties = PropertiesService.getScriptProperties();
  const savedId = properties.getProperty("SPREADSHEET_ID");
  if (savedId && savedId.trim()) return SpreadsheetApp.openById(savedId.trim());

  // The editor of a sheet-bound script has an active spreadsheet. Web app
  // requests may not, so persist its ID once for later doGet/doPost calls.
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error(
      "Open this script from Google Sheets → Extensions → Apps Script and run setupMembersSheet once to detect the spreadsheet automatically.",
    );
  }
  properties.setProperty("SPREADSHEET_ID", spreadsheet.getId());
  return spreadsheet;
}

function sheetName_() {
  return (
    PropertiesService.getScriptProperties().getProperty("MEMBER_SHEET_NAME") ||
    "Members"
  );
}

function canonicalHeader_(value) {
  const key = String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  return (
    { fullname: "name", emailaddress: "email", phonenumber: "phone" }[key] ||
    key
  );
}

function columns_(headers) {
  const columns = {};
  headers.forEach(function (header, index) {
    const key = canonicalHeader_(header);
    if (!key) return;
    if (Object.prototype.hasOwnProperty.call(columns, key)) {
      throw new Error("Duplicate member column: " + key);
    }
    columns[key] = index;
  });
  return columns;
}

/** Add missing columns to the right; never overwrite existing headers or rows. */
function ensureColumns_(sheet) {
  const width = sheet.getLastColumn();
  const headers = width ? sheet.getRange(1, 1, 1, width).getValues()[0] : [];
  const existing = columns_(headers);
  const missing = MEMBER_COLUMNS.filter(function (name) {
    return existing[canonicalHeader_(name)] === undefined;
  });
  if (missing.length) {
    const requiredWidth = width + missing.length;
    const maximumWidth = sheet.getMaxColumns();
    if (requiredWidth > maximumWidth) {
      sheet.insertColumnsAfter(maximumWidth, requiredWidth - maximumWidth);
    }
    sheet.getRange(1, width + 1, 1, missing.length).setValues([missing]);
    headers.push.apply(headers, missing);
  }
  sheet.setFrozenRows(1);
  return columns_(headers);
}

/** Call while holding the script lock so concurrent requests cannot duplicate headers. */
function ensureMemberSheet_() {
  const spreadsheet = spreadsheet_();
  const name = sheetName_();
  const sheet =
    spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  return { sheet: sheet, columns: ensureColumns_(sheet) };
}

/** Optional editor helper for initial authorization; requests also prepare the sheet. */
function setupMembersSheet() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensureMemberSheet_();
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function displayConsent_(value) {
  // Blank and unrecognised legacy values always mean private.
  return (
    value === true ||
    (typeof value === "string" &&
      ["true", "yes"].indexOf(value.trim().toLowerCase()) !== -1)
  );
}

function publicDirectory_(values) {
  if (!values.length) return { success: true, totalCount: 0, members: [] };
  const columns = columns_(values[0]);
  if (columns.name === undefined) throw new Error("Missing name column.");
  let totalCount = 0;
  const members = [];
  values.slice(1).forEach(function (row) {
    const name = String(row[columns.name] || "").trim();
    if (!name) return;
    totalCount += 1;
    if (
      columns.publicconsent === undefined ||
      !displayConsent_(row[columns.publicconsent]) ||
      !name
    )
      return;
    members.push({ name: name });
  });
  // Only consenting names and the aggregate count may leave this backend.
  return { success: true, totalCount: totalCount, members: members };
}

/** Read only the name and consent columns for the public directory. */
function readPublicDirectory_(sheet) {
  const width = sheet.getLastColumn();
  const columns = columns_(sheet.getRange(1, 1, 1, width).getValues()[0]);
  const rowCount = sheet.getLastRow() - 1;
  if (rowCount <= 0) return { success: true, totalCount: 0, members: [] };
  const names = sheet.getRange(2, columns.name + 1, rowCount, 1).getValues();
  const consents = sheet
    .getRange(2, columns.publicconsent + 1, rowCount, 1)
    .getValues();
  const rows = [["name", "publicConsent"]];
  names.forEach(function (row, index) {
    rows.push([row[0], consents[index][0]]);
  });
  return publicDirectory_(rows);
}

function doGet(e) {
  if (
    e &&
    e.parameter &&
    e.parameter.action &&
    e.parameter.action !== "members"
  ) {
    return jsonResponse_({ success: false, message: "Invalid request." });
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return jsonResponse_({
      success: false,
      message: "The member directory is busy. Please try again shortly.",
    });
  }
  try {
    const sheet = ensureMemberSheet_().sheet;
    SpreadsheetApp.flush();
    return jsonResponse_(readPublicDirectory_(sheet));
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: "The member directory is temporarily unavailable.",
    });
  } finally {
    lock.releaseLock();
  }
}

function validateApplication_(data) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    return "Invalid request.";
  if (
    typeof data.name !== "string" ||
    !data.name.trim() ||
    data.name.trim().length > 100
  )
    return "Please provide your full name.";
  if (
    typeof data.email !== "string" ||
    data.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  )
    return "Please provide a valid email address.";
  if (
    typeof data.phone !== "string" ||
    data.phone.trim().length > 20 ||
    !/^[+0-9(). \-]+$/.test(data.phone.trim()) ||
    data.phone.replace(/\D/g, "").length < 7 ||
    data.phone.replace(/\D/g, "").length > 15
  )
    return "Please provide a valid phone number.";
  if (typeof data.publicConsent !== "boolean")
    return "Please choose Yes or No for public profile consent.";
  return "";
}

function cellText_(value) {
  const text = String(value).trim();
  // Prevent submitted text being evaluated as a spreadsheet formula.
  return /^[=+@-]/.test(text) ? "'" + text : text;
}

function doPost(e) {
  let data;
  try {
    if (!e || !e.postData || e.postData.contents.length > 10000)
      throw new Error("Invalid body.");
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return jsonResponse_({ success: false, message: "Invalid request." });
  }
  const validation = validateApplication_(data);
  if (validation) return jsonResponse_({ success: false, message: validation });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000))
    return jsonResponse_({
      success: false,
      message: "Registration is busy. Please try again shortly.",
    });
  try {
    const prepared = ensureMemberSheet_();
    const sheet = prepared.sheet;
    const columns = prepared.columns;
    const values = sheet.getDataRange().getValues();
    const email = data.email.trim().toLowerCase();
    const duplicate = values.slice(1).some(function (row) {
      return (
        String(row[columns.email] || "")
          .trim()
          .toLowerCase() === email
      );
    });
    if (duplicate)
      return jsonResponse_({
        success: false,
        message:
          "This email is already registered. Contact the trust to update your details or consent.",
      });
    const record = {
      id: Utilities.getUuid(),
      createdat: new Date().toISOString(),
      name: cellText_(data.name),
      email: cellText_(email),
      phone: cellText_(data.phone),
      publicconsent: data.publicConsent,
    };
    const row = new Array(sheet.getLastColumn()).fill("");
    Object.keys(record).forEach(function (key) {
      row[columns[key]] = record[key];
    });
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    return jsonResponse_({ success: true });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message:
        "We could not confirm your registration. Please contact the trust before submitting again.",
    });
  } finally {
    lock.releaseLock();
  }
}
