# Soudagar Welfare Trust website

Responsive implementation of the supplied green-and-gold SWT homepage design, built with React, Vite, and strict TypeScript.

## Development

Use Node.js 22.12+ or a newer supported LTS release.

```sh
npm ci
cp .env.example .env
npm run dev
```

## Configuration

Set the public contact details in `.env`:

```dotenv
VITE_CONTACT_EMAIL=soudagarwelfaretrust@gmail.com
VITE_CONTACT_PHONE="+91 98765 43210"
```

All contact links and privacy contact text read these values through `src/config.ts`. The displayed phone number preserves its formatting; call links remove spaces, parentheses, dots, and hyphens. Restart the development server after editing `.env`; rebuild for production changes. Set the same variable in your hosting build environment. `.env` is ignored by Git; `.env.example` documents the configuration. Vite exposes `VITE_` variables to the browser, so use them only for public values.

### Google service URLs

Configure these in `.env` instead of placing URLs in React components:

```dotenv
VITE_GOOGLE_SCRIPT_URL=
```

- `VITE_GOOGLE_SCRIPT_URL`: deployed Google Apps Script web app endpoint, if used.

The Join Our Community form submits to `config.googleScriptUrl` using a POST request with a JSON body and `Content-Type: text/plain;charset=UTF-8`. The body contains `name`, `email`, `phone`, and a required boolean `publicConsent`. The radio question requires an explicit Yes or No; neither is preselected. The Apps Script `doPost(e)` handler should parse `JSON.parse(e.postData.contents)` and return JSON `{ "success": true }` only after saving successfully, or `{ "success": false, "message": "..." }` on failure.

The URL is read from `.env`; no endpoint is hardcoded in React. Restart Vite after changes, or rebuild for production. The deployed script must allow the website's visitors to submit and return a browser-readable response. A CORS/network failure is shown as unconfirmed, never as success. No automatic retries are made, to avoid duplicate applications. Install the supplied `google-apps-script/Code.gs` backend using [the setup instructions](google-apps-script/README.md). The existing deployment must be updated before the consent and directory features work live. All `VITE_` values are public: do not put Google credentials or private keys here.

## Member consent and Google Sheets

The join form requires **Full name**, **Email address**, **Phone number**, and a **Yes/No** choice about publishing a profile. Yes shows the first letter of the member’s name inside a circular avatar, with their full name underneath in Our Members. No counts the member without publishing any identifying details. Existing rows with no explicit consent remain private.

The site reads `GET VITE_GOOGLE_SCRIPT_URL?action=members` for the directory and refreshes after a successful application. The server checks consent and returns only consenting names plus the aggregate count. Public directory reads do not retrieve email or phone columns, and do not return IDs, timestamps, consent values, or nonconsenting names. The frontend rejects member entries containing fields other than `name`. Both displayed member counts use the backend total, including private members. Unavailable data displays a dash and a retry message rather than a made-up count.

The generated backend and deployment steps are in [google-apps-script/README.md](google-apps-script/README.md). Member avatars use initials only. Photos are not collected or displayed. The frontend clears old directory data when refreshing and does not persist profiles in browser storage. To withdraw consent, set `publicConsent` to `FALSE` in the sheet after verifying the member’s request; the change takes effect on reload or refresh.

Run `npm test` for backend consent and privacy checks. These checks use an in-memory spreadsheet and never submit to the live endpoint.

## Production

```sh
npm run build
npm run preview
```

Upload the generated `dist/` directory to a static host. No server runtime is required.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy.yml` builds and deploys on pushes to `main` or a manual run from the Actions tab. If your deployment branch has another name, change `on.push.branches` in that file.

1. Push this project, including `package-lock.json` and `.github/workflows/deploy.yml`, to your GitHub repository.
2. In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
3. In **Settings → Secrets and variables → Actions → Secrets → New repository secret**, create these repository secrets with the values from your local `.env`:

   | Secret                   | Value                                 |
   | ------------------------ | ------------------------------------- |
   | `VITE_CONTACT_EMAIL`     | Your official contact email           |
   | `VITE_CONTACT_PHONE`     | Your contact phone number             |
   | `VITE_GOOGLE_SCRIPT_URL` | Your deployed Apps Script `/exec` URL |

4. Push to `main`, or open **Actions → Deploy to GitHub Pages → Run workflow**. The deployment job reports the published site URL.

The workflow validates the secrets before building and uses GitHub Pages metadata to set Vite’s base path for repository sites, account sites, and configured custom domains. Images and the favicon respect this path. Your local `.env` remains ignored; the workflow does not upload it. These variables are embedded into the public frontend during the build. Changing them requires another workflow run.

References: [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages), [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Included

- Responsive navigation, hero, mission, impact figures, five activity cards, members, gallery, testimonials, and footer.
- Keyboard-accessible native dialogs, gallery controls, reduced-motion support, labelled inputs, and focus indicators.
- Membership form with browser validation, Apps Script submission, a pending state, duplicate-submit prevention, and confirmed success or error feedback.
- All photographs are included in `public/images`; fonts load from Google Fonts.

## Before public launch

The official contact email is `soudagarwelfaretrust@gmail.com`. Verify the reference design's phone number (`+91 98765 43210`), impact figures, testimonials, and organization information. Gallery photos are illustrative, not verified SWT records. Replace them with approved organization photos. Member profiles come from the consent-filtered Google Sheets directory. Social-style footer buttons currently link to actual contact and community actions; replace them with verified social profiles if available.

Membership applications are sent to the configured Apps Script backend. Verify its field mapping, storage, access settings, and data handling before collecting real member details.

Main content and interactions: `src/App.tsx`. Responsive styling: `src/styles.css`. Photo credits: `public/images/ATTRIBUTION.md`.
