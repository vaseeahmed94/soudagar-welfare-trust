import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/**", "node_modules/**", "coverage/**"]),
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: { "prefer-arrow-callback": "error" },
  },
  {
    files: ["src/**/*.{ts,tsx}", "vite.config.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration",
          message:
            "Use a named arrow function for components, hooks, and helpers.",
        },
      ],
    },
  },
  {
    files: ["src/**/*.tsx"],
    extends: [reactRefresh.configs.vite],
  },
  {
    files: ["google-apps-script/**/*.gs"],
    extends: [js.configs.recommended],
    languageOptions: {
      sourceType: "script",
      globals: {
        ContentService: "readonly",
        PropertiesService: "readonly",
        SpreadsheetApp: "readonly",
        LockService: "readonly",
        Utilities: "readonly",
        MailApp: "readonly",
        Logger: "readonly",
        ScriptApp: "readonly",
        Session: "readonly",
      },
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "FunctionDeclaration:not([id.name='doGet']):not([id.name='doPost']):not([id.name='setupMembersSheet']):not([id.name='authorizeEmail']):not([id.name='testWelcomeEmail']):not([id.name='testMonthlyReminderEmail']):not([id.name='processMonthlyReminderQueue']):not([id.name='setupMonthlyReminderTrigger'])",
          message:
            "Use arrow functions for internal helpers; keep Apps Script entry points as declarations.",
        },
      ],
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern:
            "^(doGet|doPost|setupMembersSheet|authorizeEmail|testWelcomeEmail|testMonthlyReminderEmail|processMonthlyReminderQueue|setupMonthlyReminderTrigger)$",
        },
      ],
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
    },
  },
  {
    files: ["tests/**/*.cjs"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration",
          message: "Use a named arrow function for test helpers.",
        },
      ],
    },
  },
  {
    files: ["tests/types/**/*.ts"],
    extends: [tseslint.configs.recommended],
  },
  // Formatting belongs to Prettier; disable conflicting stylistic lint rules.
  prettier,
]);
