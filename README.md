# Soudagar Welfare Trust website

Responsive implementation of the supplied green-and-gold SWT homepage design, built with React, Vite, Tailwind CSS, and strict TypeScript.

## Development

Use Node.js 22.22.1+ or Node.js 24+ (the GitHub Actions workflow uses Node.js 24).

```sh
npm ci
cp .env.example .env
npm run dev
```

## Code quality and formatting

```sh
npm run lint          # Type-aware ESLint; warnings fail the check
npm run lint:fix      # Apply safe ESLint fixes
npm run format       # Format source, CSS, docs, and Apps Script
npm run format:check # Check formatting without changing files
npm run check        # Lint, formatting, tests, and production build
```

`eslint.config.js` uses ESLint's flat configuration with the recommended JavaScript and type-checked TypeScript rules. It enforces core React hook rules and effect dependencies, Fast Refresh-safe exports, type-only imports, unused-code checks, promise handling, strict equality, and arrow functions in `src`. Async React event handlers are allowed. Callbacks and internal helpers use arrow functions across frontend, tests, and Apps Script. Apps Script keeps `doGet`, `doPost`, and `setupMembersSheet` as named entry points; object methods that use `this` retain method syntax. Generated files and dependencies are ignored.

`prettier.config.mjs` handles formatting separately from ESLint, using two spaces, double quotes, semicolons, LF line endings, and trailing commas. Its Tailwind plugin sorts utility classes using the project's stylesheet. `.editorconfig` and the recommended VS Code extensions support consistent editing and formatting on save. CI checks lint and formatting before deploying.

TypeScript is pinned to the stable `6.0.3` release in both the manifest and lockfile. This is the newest stable release supported by the installed TypeScript ESLint parser, whose supported range is `>=4.8.4 <6.1.0`; TypeScript 7 is not supported by that parser yet. The scoped `minimatch` override pins the parser's glob dependency to its patched release; keep it until the parser updates that dependency.

References: [ESLint configuration](https://eslint.org/docs/latest/use/configure/configuration-files), [type-aware TypeScript rules](https://typescript-eslint.io/getting-started/typed-linting/), and [Prettier integration](https://prettier.io/docs/integrating-with-linters).

### Before committing

`npm install` and `npm ci` install Husky through the `prepare` script. The pre-commit hook runs `npm run lint:staged`: staged JavaScript, TypeScript, and Apps Script files receive ESLint fixes followed by Prettier; staged CSS, JSON, Markdown, HTML, and YAML files receive Prettier formatting. Fixes are staged automatically, and remaining lint errors block the commit. Lint-staged preserves unstaged edits, including edits in partially staged files.

Use `npm run lint:staged` to run the same checks manually. The full repository checks still run in CI. Hook configuration lives in `.husky/pre-commit` and `lint-staged.config.js`.

References: [Husky setup](https://typicode.github.io/husky/get-started.html) and [lint-staged](https://github.com/lint-staged/lint-staged).

## Configuration

Set the public contact details in `.env`:

```dotenv
VITE_CONTACT_EMAIL=soudagarwelfaretrust@gmail.com
VITE_CONTACT_PHONE="+91 98765 43210"
```

All contact links and privacy contact text read these values through `src/config/appConfig.ts`. The displayed phone number preserves its formatting; call links remove spaces, parentheses, dots, and hyphens. Restart the development server after editing `.env`; rebuild for production changes. Set the same variable in your hosting build environment. `.env` is ignored by Git; `.env.example` documents the configuration. Vite exposes `VITE_` variables to the browser, so use them only for public values.

### Google service URLs

Configure these in `.env` instead of placing URLs in React components:

```dotenv
VITE_GOOGLE_SCRIPT_URL=
```

- `VITE_GOOGLE_SCRIPT_URL`: deployed Google Apps Script web app endpoint, if used.

The Join Our Community form submits to `config.googleScriptUrl` using a POST request with a JSON body and `Content-Type: text/plain;charset=UTF-8`. The body contains `name`, `email`, `phone`, and a required boolean `publicConsent`. The radio question requires an explicit Yes or No; neither is preselected. The Apps Script `doPost(e)` handler should parse `JSON.parse(e.postData.contents)` and return JSON `{ "success": true }` only after saving successfully, or `{ "success": false, "message": "..." }` on failure.

The URL is read from `.env`; no endpoint is hardcoded in React. Restart Vite after changes, or rebuild for production. The deployed script must allow the website's visitors to submit and return a browser-readable response. A CORS/network failure is shown as unconfirmed, never as success. No automatic retries are made, to avoid duplicate applications. Install the supplied `google-apps-script/Code.gs` backend using [the setup instructions](google-apps-script/README.md). The existing deployment must be updated before the consent and directory features work live. All `VITE_` values are public: do not put Google credentials or private keys here.

## Styling with Tailwind

Tailwind CSS v4 runs through the official `@tailwindcss/vite` plugin. `src/assets/styles/tailwind.css` imports the theme and utilities and maps semantic utilities such as `bg-panel`, `text-content`, `text-muted`, and `border-outline` to the shared theme colors. The `dark:` variant follows `data-theme` and the header theme selector.

Use utilities for layout, spacing, typography, and interactive states. Keep custom artwork, complex gradients, and existing design-specific responsive rules in `src/assets/styles/global.css`. Styles use plain CSS, not SCSS. Tailwind Preflight is omitted because the project already has a global reset. Avoid adding CSS declarations that duplicate a component's utilities.

Reference: [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite).

## Languages

English is the default language; the top-bar selector lists English and Kannada (ಕನ್ನಡ), in that order. Language selection is saved in browser storage and synchronized between tabs, independently of the color theme. The page language, direction, title, and description update with the selection. Member names, contact details, image filenames, and API payloads remain unchanged.

`src/locales/` contains English (`en.json`) and Kannada (`kn.json`) catalogs. All catalogs use stable semantic keys grouped by feature, such as `navigation.home` and `membership.consentLegend`. Translate full sentences rather than joining translated fragments. `catalogs.ts` checks catalog completeness; missing messages fall back to English.

`config.ts` defines the language order, default, text direction, and regional formatting. `LocaleProvider.tsx` and `useLocale.ts` expose typed `t(key, values)`, `formatNumber`, and `formatMemberCount` helpers. TypeScript rejects unknown keys, missing interpolation values, and incorrect value types. Content constants store `titleKey`, `labelKey`, and related keys instead of English copy. `membershipErrors.ts` maps existing Apps Script messages to locale keys and gives unknown failures a translated fallback.

For example:

```tsx
const { t } = useLocale();
t("navigation.home");
t("privacy.contact", { email: appConfig.contactEmail });
```

Run `npm run test:types` for translation API type checks. Runtime tests cover catalog parity, placeholders, storage failures, plurals, number formatting, metadata, and error fallbacks. The full `npm run check` and CI include these checks.

## Theme

The theme selector beside the header navigation offers **Light** and **Dark**, with Light as the default regardless of device settings. Your choice is saved in browser storage and synchronized between tabs. The saved choice is applied before the first paint, including the full-page loader. Theme switching still works for the current visit if storage is unavailable.

Edit `src/assets/styles/theme.css` for shared light and dark colors. `ThemeProvider.tsx` manages the saved preference, `useTheme.ts` exposes theme state, and `ThemeSwitcher.tsx` renders the accessible selector. New components should use the semantic CSS variables rather than fixed surface or text colors.

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
- All photographs are included in `src/assets/images` and bundled by Vite with hashed URLs; fonts load from Google Fonts.

## Before public launch

The official contact email is `soudagarwelfaretrust@gmail.com`. Verify the reference design's phone number (`+91 98765 43210`), impact figures, testimonials, and organization information. Gallery photos are illustrative, not verified SWT records. Replace them with approved organization photos. Member profiles come from the consent-filtered Google Sheets directory. Social-style footer buttons currently link to actual contact and community actions; replace them with verified social profiles if available.

Membership applications are sent to the configured Apps Script backend. Verify its field mapping, storage, access settings, and data handling before collecting real member details.

## Source structure

`src/App.tsx` assembles the page and coordinates member loading and navigation.

- `src/assets/images/`: bundled photographs, favicon, and image attribution.
- `src/assets/styles/`: Tailwind entry, theme tokens, and custom CSS.
- `src/components/common/`: shared logo, spinner, and full-page loader.
- `src/components/layout/`: header and footer.
- `src/components/sections/`: homepage sections, including members, activities, gallery, and testimonials.
- `src/components/dialogs/`: membership form, member directory, gallery lightbox, activity details, and policy content.
- `src/components/dialogs/AppDialog.tsx`: dialog lifecycle and membership submission state.
- `src/hooks/`: member fetching, theme, and language state access.
- `src/locales/`: English and Kannada messages, locale configuration, and provider.
- `src/services/`: membership API requests and response validation.
- `src/constants/`: separate files for activities, gallery captions, testimonials, and navigation.
- `src/types/`: shared domain types in `*.types.ts` files.
- `src/config/`: public application configuration.
- `src/utils/`: shared image path helper.

Naming conventions: component files and props interfaces use PascalCase; hooks use `use` followed by a descriptive name; utilities, services, functions, and variables use camelCase; constants use UPPER_SNAKE_CASE. Boolean names start with `is` or `has`, refs end in `Ref`, callback props start with `on`, and event handlers start with `handle`.

Responsive styling: `src/assets/styles/global.css`. Photo credits: `src/assets/images/ATTRIBUTION.md`.
