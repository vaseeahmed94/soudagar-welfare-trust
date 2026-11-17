# Google Sheets membership backend

`Code.gs` is the backend for the site's membership form and consent-based member directory. It needs to be deployed in your Google account; generating this file does not change your existing live script.

## Set up

1. Create a private Google spreadsheet, or use your existing membership spreadsheet. Keep the spreadsheet private: the script returns only the approved public directory.
2. Open **Extensions → Apps Script** from the spreadsheet, or open your existing Apps Script project associated with `VITE_GOOGLE_SCRIPT_URL`.
3. Save a copy of your existing script before replacing its membership handlers. Paste `Code.gs` into the Apps Script editor. Avoid duplicate `doGet` or `doPost` functions; merge unrelated existing functionality if needed.
4. Open the script through your spreadsheet’s **Extensions → Apps Script**, select `setupMembersSheet`, and click **Run**. Authorize access when prompted, including permission to send email. The script detects the attached spreadsheet ID and saves it automatically in Script Properties for web requests. No ID needs to be copied manually. Optionally set `MEMBER_SHEET_NAME` in Script Properties to an existing tab name; the default is `Members`. Set `WELCOME_REPLY_TO` to the trust’s monitored reply address if you want replies routed somewhere specific; otherwise the configured trust address is used.
   For safe email testing, set a `TEST_EMAIL` Script Property to your own address, then run `testWelcomeEmail` or `testMonthlyReminderEmail`. These test functions never send to member rows.
5. The script automatically creates the member tab and any missing columns on every directory read and valid registration. Manual header creation is not required. The one-time editor run above saves the spreadsheet connection; later requests automatically maintain the tab and columns. If you use an existing tab, row 1 must contain its headers. Existing `Full name`, `Email address`, and `Phone number` headers are recognised. If your headers differ, rename them or adjust `canonicalHeader_` first. Blank consent stays private.
6. Choose **Deploy → New deployment → Web app**, or update the existing web app deployment to a **New version**. Execute as **Me** and allow access to **Anyone** so public site visitors can submit and read the directory. Workspace policies may limit this option.
7. Copy the deployed `/exec` URL to local `.env` and the GitHub Actions repository secret `VITE_GOOGLE_SCRIPT_URL`. Restart Vite locally and rerun the Pages workflow after changes. Updating the existing deployment can retain its URL.

## Automatic sheet setup

Every directory read and valid registration checks for the member tab and required columns. Missing columns are appended automatically, even if removed later. Existing headers, extra columns, and member rows are preserved. Repeated requests do not create duplicate columns. A script lock prevents simultaneous requests from creating duplicate tabs or headers. Recreating a deleted column restores its header only; deleted member data cannot be recovered. A recreated consent column is blank, so affected members remain private until fresh consent is provided.

Create or select your Google spreadsheet and run `setupMembersSheet` once from its bound Apps Script editor. This automatically saves `SPREADSHEET_ID`; the script creates the tab and columns inside that spreadsheet. Web app requests do not reliably have an active spreadsheet, so they use this saved ID. For a standalone script that is not bound to a sheet, set `SPREADSHEET_ID` manually in Script Properties. An existing saved ID takes precedence; remove it and rerun setup from the intended bound sheet if you want to change the automatic connection.

## Sheet columns

| Column                   | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `id`                     | Generated member identifier                                    |
| `createdAt`              | Registration timestamp                                         |
| `name`                   | Full name                                                      |
| `email`                  | Private contact email                                          |
| `phone`                  | Private contact number                                         |
| `publicConsent`          | `TRUE` for public display; `FALSE` for count only              |
| `monthlyReminderEnabled` | Blank/`TRUE` receives monthly reminders; `FALSE` disables them |
| `welcomeEmailStatus`     | `sent`, `failed`, or `pending` delivery state                  |
| `welcomeEmailSentAt`     | Timestamp recorded after a welcome email is sent               |

The site always shows the first letter of the member’s name inside a circular avatar, with their full name underneath. Photos are not uploaded, collected, returned, or displayed. Any existing `photoUrl` sheet column is left untouched and ignored.

The total includes all membership rows with a name. Only rows with explicit `TRUE`/`yes` consent and a nonempty name are returned as profiles. Blank, `FALSE`, `no`, missing, and unknown consent values never publish a profile. Do not set old members' consent to `TRUE` without obtaining their permission. Set it to `FALSE` to withdraw a profile; the website reads the latest directory on reload or retry. The directory reads only the name and consent columns internally, and returns only consenting names plus the total count. Email and phone are never read for the directory or included in its response.

## API contract

The member contribution portal uses email verification rather than exposing private sheet data. The first request creates `AccessCodes`, `AccessSessions`, `Contributions`, and `Activities` tabs automatically. Add contribution rows with the member's email in `memberEmail`; the portal only returns rows matching the verified email.

Supported portal requests are `requestAccessCode` (`email`), `verifyAccessCode` (`email`, `code`), and `memberDetails` (`token`). Codes expire after 5 minutes and sessions expire after 30 minutes. Store only operational data in the sheet and keep the spreadsheet private.

POST JSON with `Content-Type: text/plain;charset=UTF-8`:

```json
{
  "name": "Example Member",
  "email": "member@example.com",
  "phone": "9876543210",
  "publicConsent": false
}
```

A saved application returns `{"success":true}`. Validation, duplicate email, and service errors return `{"success":false,"message":"..."}`. Duplicate registrations do not overwrite existing consent. Changes to existing membership details or consent are handled by the trust in the sheet after verifying the member's request.

Each first-time registration sends one welcome email to the submitted address after the row is saved. Duplicate email submissions are rejected before sending another message. If Google’s email service is unavailable or its daily sending quota is reached, the membership remains saved and `welcomeEmailStatus` is recorded as `failed`; the trust can contact that member manually. Google Apps Script’s Mail service and daily quotas apply.

GET `/exec?action=members` returns:

```json
{
  "success": true,
  "totalCount": 2,
  "members": [
    {
      "name": "Example Member"
    }
  ]
}
```

Here the second member is counted but no identifying information about that member is returned. Consent is checked on the server. The public response includes names only, with no member IDs, email addresses, phone numbers, timestamps, or consent values. The frontend rejects member entries containing additional fields.

## Verify after deployment

- Register a test person with **No**: the total increases, but their name is not returned in GET or shown on the site.
- Register a different test person with **Yes**: the total increases and their name and initial appear. Confirm that no profile image is requested or displayed.
- Confirm that choosing neither Yes nor No blocks submission.
- Confirm existing blank-consent rows are counted without exposing their names.
- Submit one new address and confirm the welcome email arrives; submit the same address again and confirm no second welcome email is sent.
- Remove the test rows afterwards. Automated project checks use mocks and do not submit to your live sheet.

References: [Google web app deployment](https://developers.google.com/apps-script/guides/web), [Script properties](https://developers.google.com/apps-script/guides/properties), [Mail service](https://developers.google.com/apps-script/reference/mail/mail-app), and [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas).
