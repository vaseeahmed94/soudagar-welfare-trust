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
  "monthlyReminderEnabled",
  "welcomeEmailStatus",
  "welcomeEmailSentAt",
];
const REMINDER_COLUMNS = [
  "name",
  "email",
  "reminderMonth",
  "sentAt",
  "status",
  "attempts",
  "error",
];
const REMINDER_DAILY_SEND_LIMIT = 80;
const REMINDER_RETRY_LIMIT = 3;

const jsonResponse_ = (data) => {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
};

const spreadsheet_ = () => {
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
};

const sheetName_ = () => {
  return (
    PropertiesService.getScriptProperties().getProperty("MEMBER_SHEET_NAME") ||
    "Members"
  );
};

const canonicalHeader_ = (value) => {
  const key = String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  return (
    { fullname: "name", emailaddress: "email", phonenumber: "phone" }[key] ||
    key
  );
};

const columns_ = (headers) => {
  const columns = {};
  headers.forEach((header, index) => {
    const key = canonicalHeader_(header);
    if (!key) return;
    if (Object.prototype.hasOwnProperty.call(columns, key)) {
      throw new Error("Duplicate member column: " + key);
    }
    columns[key] = index;
  });
  return columns;
};

/** Add missing columns to the right; never overwrite existing headers or rows. */
const ensureColumns_ = (sheet) => {
  const width = sheet.getLastColumn();
  const headers = width ? sheet.getRange(1, 1, 1, width).getValues()[0] : [];
  const existing = columns_(headers);
  const missing = MEMBER_COLUMNS.filter((name) => {
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
};

/** Call while holding the script lock so concurrent requests cannot duplicate headers. */
const ensureMemberSheet_ = () => {
  const spreadsheet = spreadsheet_();
  const name = sheetName_();
  const sheet =
    spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  return { sheet: sheet, columns: ensureColumns_(sheet) };
};

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

/** Run once in the editor to authorize MailApp and verify the daily quota. */
function authorizeEmail() {
  const remainingQuota = MailApp.getRemainingDailyQuota();
  Logger.log(
    "Welcome email authorization complete. Remaining quota: " + remainingQuota,
  );
}

const testEmailRecipient_ = () => {
  const recipient = normalizedEmail_(
    PropertiesService.getScriptProperties().getProperty("TEST_EMAIL"),
  );
  if (!recipient) {
    throw new Error(
      "Set TEST_EMAIL in Script Properties before running an email test.",
    );
  }
  return recipient;
};

/** Sends a welcome-email preview only to the TEST_EMAIL script property. */
function testWelcomeEmail() {
  const recipient = testEmailRecipient_();
  welcomeEmail_("Test Member", recipient);
  Logger.log("Welcome email test sent to the configured TEST_EMAIL.");
}

/** Sends a monthly-reminder preview only to the TEST_EMAIL script property. */
function testMonthlyReminderEmail() {
  const recipient = testEmailRecipient_();
  sendMonthlyReminder_("Test Member", recipient);
  Logger.log("Monthly reminder test sent to the configured TEST_EMAIL.");
}

const ensureReminderSheet_ = () => {
  const spreadsheet = spreadsheet_();
  const sheet =
    spreadsheet.getSheetByName("MonthlyReminders") ||
    spreadsheet.insertSheet("MonthlyReminders");
  const width = sheet.getLastColumn();
  const headers = width ? sheet.getRange(1, 1, 1, width).getValues()[0] : [];
  const existing = columns_(headers);
  const missing = REMINDER_COLUMNS.filter((name) => {
    return existing[canonicalHeader_(name)] === undefined;
  });
  if (missing.length) {
    const requiredWidth = width + missing.length;
    const maximumWidth = sheet.getMaxColumns();
    if (requiredWidth > maximumWidth) {
      sheet.insertColumnsAfter(maximumWidth, requiredWidth - maximumWidth);
    }
    sheet.getRange(1, width + 1, 1, missing.length).setValues([missing]);
  }
  sheet.setFrozenRows(1);
  return {
    sheet: sheet,
    columns: columns_(
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0],
    ),
  };
};

const scriptDate_ = () => {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd",
  );
};

const reminderMonth_ = (dateText) => dateText.slice(0, 7);

const isFirstDayOfMonth_ = (dateText) => dateText.slice(8, 10) === "01";

const normalizedEmail_ = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const reminderEnabled_ = (value) => {
  if (value === undefined || value === "") return true;
  return !["false", "no", "0", "off"].includes(
    String(value).trim().toLowerCase(),
  );
};

const monthlyReminderBody_ = (name) => {
  return [
    `Hello ${String(name || "Member").trim()},`,
    "",
    "This is your monthly contribution reminder from Soudagar Welfare Trust.",
    "Your continued support helps us build a more caring community.",
    "",
    "SWT Donation Details",
    "₹30 / month",
    "Just ₹1 a day can make a difference.",
    "",
    "If you have already made this month's contribution, please disregard this reminder.",
    "For any questions, please reply to this email or contact the trust.",
    "",
    "With regards,",
    "Soudagar Welfare Trust",
  ].join("\n");
};

const htmlEscape_ = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const monthlyReminderHtml_ = (name) => {
  const safeName = htmlEscape_(name || "Member");
  const logoUrl =
    "https://raw.githubusercontent.com/vaseeahmed94/soudagar-welfare-trust/main/src/assets/images/favicon.svg";
  return `
    <div style="margin:0;background:#fbfaf4;padding:32px 16px;font-family:Arial,sans-serif;color:#17382b;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dce7dc;border-radius:16px;overflow:hidden;">
        <div style="background:#075c38;padding:24px;text-align:center;">
          <img src="${logoUrl}" alt="Soudagar Welfare Trust" width="64" height="64" style="display:inline-block;border-radius:14px;" />
        </div>
        <div style="padding:30px 28px;">
          <p style="margin:0 0 14px;color:#b38a2a;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Monthly contribution reminder</p>
          <h1 style="margin:0 0 18px;color:#075c38;font-size:26px;line-height:1.2;">Hello ${safeName},</h1>
          <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">This is your monthly contribution reminder from Soudagar Welfare Trust.</p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Your continued support helps us build a more caring community.</p>
          <div style="margin:22px 0;padding:18px;text-align:center;border:1px solid #c9a64d;border-radius:12px;background:#075c38;color:#ffffff;">
            <p style="margin:0 0 6px;color:#e7c86b;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">SWT Donation Details</p>
            <p style="margin:0;color:#e7c86b;font-size:30px;font-weight:bold;">₹30 / month</p>
            <p style="margin:4px 0 0;color:#e3f0e4;font-size:14px;">Just ₹1 a day can make a difference.</p>
          </div>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#5c7165;">If you have already made this month's contribution, please disregard this reminder.</p>
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #dce7dc;">
            <p style="margin:0;font-size:15px;line-height:1.6;">With warm regards,</p>
            <p style="margin:4px 0 0;color:#075c38;font-size:16px;font-weight:bold;">Soudagar Welfare Trust</p>
            <p style="margin:4px 0 0;color:#b38a2a;font-size:12px;letter-spacing:1px;">HUMANITY · SERVICE · UNITY</p>
          </div>
        </div>
      </div>
    </div>`;
};

const welcomeEmailHtml_ = (name) => {
  const safeName = htmlEscape_(name || "Member");
  const logoUrl =
    "https://raw.githubusercontent.com/vaseeahmed94/soudagar-welfare-trust/main/src/assets/images/favicon.svg";
  return `
    <div style="margin:0;background:#fbfaf4;padding:32px 16px;font-family:Arial,sans-serif;color:#17382b;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dce7dc;border-radius:16px;overflow:hidden;">
        <div style="background:#075c38;padding:24px;text-align:center;">
          <img src="${logoUrl}" alt="Soudagar Welfare Trust" width="64" height="64" style="display:inline-block;border-radius:14px;" />
        </div>
        <div style="padding:30px 28px;">
          <p style="margin:0 0 14px;color:#b38a2a;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Welcome to our community</p>
          <h1 style="margin:0 0 18px;color:#075c38;font-size:26px;line-height:1.2;">Hello ${safeName},</h1>
          <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Thank you for joining Soudagar Welfare Trust.</p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">We have received your membership application and will review it shortly. We are grateful for your interest in serving our community together.</p>
          <div style="margin:22px 0;padding:18px;text-align:center;border:1px solid #c9a64d;border-radius:12px;background:#075c38;color:#ffffff;">
            <p style="margin:0 0 6px;color:#e7c86b;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">SWT Donation Details</p>
            <p style="margin:0;color:#e7c86b;font-size:30px;font-weight:bold;">₹30 / month</p>
            <p style="margin:4px 0 0;color:#e3f0e4;font-size:14px;">Just ₹1 a day can make a difference.</p>
          </div>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#5c7165;">If you did not submit this application, please contact the trust.</p>
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #dce7dc;">
            <p style="margin:0;font-size:15px;line-height:1.6;">With warm regards,</p>
            <p style="margin:4px 0 0;color:#075c38;font-size:16px;font-weight:bold;">Soudagar Welfare Trust</p>
            <p style="margin:4px 0 0;color:#b38a2a;font-size:12px;letter-spacing:1px;">HUMANITY · SERVICE · UNITY</p>
          </div>
        </div>
      </div>
    </div>`;
};

const queueMonthlyReminders_ = (today, month) => {
  if (!isFirstDayOfMonth_(today)) return;
  const preparedMembers = ensureMemberSheet_();
  const memberRows = preparedMembers.sheet.getDataRange().getValues();
  const preparedReminders = ensureReminderSheet_();
  const reminderSheet = preparedReminders.sheet;
  const reminderColumns = preparedReminders.columns;
  const existing = reminderSheet.getDataRange().getValues();
  const queued = new Set(
    existing.slice(1).map((row) => {
      return `${normalizedEmail_(row[reminderColumns.email])}|${row[reminderColumns.remindermonth]}`;
    }),
  );
  const memberColumns = preparedMembers.columns;
  memberRows.slice(1).forEach((row) => {
    const email = normalizedEmail_(row[memberColumns.email]);
    if (
      !email ||
      !String(row[memberColumns.name] || "").trim() ||
      (memberColumns.monthlyreminderenabled !== undefined &&
        !reminderEnabled_(row[memberColumns.monthlyreminderenabled]))
    )
      return;
    const key = `${email}|${month}`;
    if (queued.has(key)) return;
    const output = new Array(reminderSheet.getLastColumn()).fill("");
    output[reminderColumns.name] = cellText_(row[memberColumns.name]);
    output[reminderColumns.email] = cellText_(email);
    output[reminderColumns.remindermonth] = month;
    output[reminderColumns.status] = "pending";
    output[reminderColumns.attempts] = 0;
    reminderSheet.appendRow(output);
    queued.add(key);
  });
};

const sendMonthlyReminder_ = (name, email) => {
  MailApp.sendEmail({
    to: email,
    subject: "Your monthly contribution reminder | Soudagar Welfare Trust",
    body: monthlyReminderBody_(name),
    htmlBody: monthlyReminderHtml_(name),
    name: "Soudagar Welfare Trust",
    replyTo:
      PropertiesService.getScriptProperties().getProperty("WELCOME_REPLY_TO") ||
      "soudagarwelfaretrust@gmail.com",
  });
};

/** Daily trigger entry point. Queues on month-start and drains safely over later days. */
function processMonthlyReminderQueue() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;
  try {
    const today = scriptDate_();
    const month = reminderMonth_(today);
    queueMonthlyReminders_(today, month);
    const prepared = ensureReminderSheet_();
    const sheet = prepared.sheet;
    const columns = prepared.columns;
    const rows = sheet.getDataRange().getValues();
    const quota = MailApp.getRemainingDailyQuota();
    const available = Math.max(
      0,
      Math.min(REMINDER_DAILY_SEND_LIMIT, quota - 10),
    );
    let sent = 0;
    rows.slice(1).forEach((row, index) => {
      if (sent >= available) return;
      const status = String(row[columns.status] || "").toLowerCase();
      const attempts = Number(row[columns.attempts] || 0);
      if (
        !["pending", "failed"].includes(status) ||
        attempts >= REMINDER_RETRY_LIMIT
      )
        return;
      const rowNumber = index + 2;
      try {
        sendMonthlyReminder_(
          row[columns.name],
          normalizedEmail_(row[columns.email]),
        );
        sheet
          .getRange(rowNumber, columns.sentat + 1, 1, 4)
          .setValues([[new Date().toISOString(), "sent", attempts + 1, ""]]);
        sent += 1;
      } catch (error) {
        const message =
          error && error.message ? error.message : "Unknown email error";
        sheet
          .getRange(rowNumber, columns.sentat + 1, 1, 4)
          .setValues([["", "failed", attempts + 1, message.slice(0, 200)]]);
        Logger.log("Monthly reminder failed: " + message);
      }
    });
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

/** Run once to create the daily queue trigger. */
function setupMonthlyReminderTrigger() {
  ScriptApp.getProjectTriggers().forEach((trigger) => {
    if (trigger.getHandlerFunction() === "processMonthlyReminderQueue")
      ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger("processMonthlyReminderQueue")
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}

const displayConsent_ = (value) => {
  // Blank and unrecognised legacy values always mean private.
  return (
    value === true ||
    (typeof value === "string" &&
      ["true", "yes"].indexOf(value.trim().toLowerCase()) !== -1)
  );
};

const publicDirectory_ = (values) => {
  if (!values.length) return { success: true, totalCount: 0, members: [] };
  const columns = columns_(values[0]);
  if (columns.name === undefined) throw new Error("Missing name column.");
  let totalCount = 0;
  const members = [];
  values.slice(1).forEach((row) => {
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
};

/** Read only the name and consent columns for the public directory. */
const readPublicDirectory_ = (sheet) => {
  const width = sheet.getLastColumn();
  const columns = columns_(sheet.getRange(1, 1, 1, width).getValues()[0]);
  const rowCount = sheet.getLastRow() - 1;
  if (rowCount <= 0) return { success: true, totalCount: 0, members: [] };
  const names = sheet.getRange(2, columns.name + 1, rowCount, 1).getValues();
  const consents = sheet
    .getRange(2, columns.publicconsent + 1, rowCount, 1)
    .getValues();
  const rows = [["name", "publicConsent"]];
  names.forEach((row, index) => {
    rows.push([row[0], consents[index][0]]);
  });
  return publicDirectory_(rows);
};

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
  } catch {
    return jsonResponse_({
      success: false,
      message: "The member directory is temporarily unavailable.",
    });
  } finally {
    lock.releaseLock();
  }
}

const validateApplication_ = (data) => {
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
    !/^[+0-9(). -]+$/.test(data.phone.trim()) ||
    data.phone.replace(/\D/g, "").length < 7 ||
    data.phone.replace(/\D/g, "").length > 15
  )
    return "Please provide a valid phone number.";
  if (typeof data.publicConsent !== "boolean")
    return "Please choose Yes or No for public profile consent.";
  return "";
};

const cellText_ = (value) => {
  const text = String(value).trim();
  // Prevent submitted text being evaluated as a spreadsheet formula.
  return /^[=+@-]/.test(text) ? "'" + text : text;
};

const welcomeEmail_ = (name, email) => {
  const safeName = String(name).trim();
  const subject = "Welcome to Soudagar Welfare Trust";
  const body = [
    `Hello ${safeName},`,
    "",
    "Thank you for joining Soudagar Welfare Trust.",
    "We have received your membership application and will review it shortly.",
    "",
    "SWT Donation Details",
    "₹30 / month",
    "Just ₹1 a day can make a difference.",
    "",
    "If you did not submit this application, please contact the trust.",
    "",
    "With warm regards,",
    "Soudagar Welfare Trust",
    "HUMANITY · SERVICE · UNITY",
  ].join("\n");
  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body,
    htmlBody: welcomeEmailHtml_(name),
    name: "Soudagar Welfare Trust",
    replyTo:
      PropertiesService.getScriptProperties().getProperty("WELCOME_REPLY_TO") ||
      "soudagarwelfaretrust@gmail.com",
  });
};

const sendWelcomeEmail_ = (sheet, columns, name, email, rowNumber) => {
  try {
    welcomeEmail_(name, email);
    if (columns.welcomeemailstatus !== undefined) {
      sheet
        .getRange(rowNumber, columns.welcomeemailstatus + 1, 1, 2)
        .setValues([["sent", new Date().toISOString()]]);
    }
  } catch (error) {
    Logger.log(
      "Welcome email failed: " +
        (error && error.message ? error.message : "Unknown email error"),
    );
    if (columns.welcomeemailstatus !== undefined) {
      sheet
        .getRange(rowNumber, columns.welcomeemailstatus + 1, 1, 2)
        .setValues([["failed", ""]]);
    }
  }
};

function doPost(e) {
  let data;
  try {
    if (!e || !e.postData || e.postData.contents.length > 10000)
      throw new Error("Invalid body.");
    data = JSON.parse(e.postData.contents);
  } catch {
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
    const duplicate = values.slice(1).some((row) => {
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
      monthlyreminderenabled: true,
      welcomeemailstatus: "pending",
      welcomeemailsentat: "",
    };
    const row = new Array(sheet.getLastColumn()).fill("");
    Object.keys(record).forEach((key) => {
      row[columns[key]] = record[key];
    });
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    sendWelcomeEmail_(sheet, columns, data.name, email, sheet.getLastRow());
    SpreadsheetApp.flush();
    return jsonResponse_({ success: true });
  } catch {
    return jsonResponse_({
      success: false,
      message:
        "We could not confirm your registration. Please contact the trust before submitting again.",
    });
  } finally {
    lock.releaseLock();
  }
}
