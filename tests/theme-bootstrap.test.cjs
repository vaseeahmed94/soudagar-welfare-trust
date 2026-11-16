const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const html = readFileSync(
  new URL("../index.html", `file://${__filename}`),
  "utf8",
);
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const resolveInitialTheme = (
  savedPreference,
  systemIsDark,
  storageUnavailable = false,
) => {
  const document = { documentElement: { dataset: {} } };
  runInNewContext(bootstrap, {
    document,
    localStorage: {
      getItem(key) {
        assert.equal(key, "swt-theme");
        if (storageUnavailable) throw new Error("Storage blocked");
        return savedPreference;
      },
    },
    matchMedia: () => ({ matches: systemIsDark }),
  });
  return document.documentElement.dataset.theme;
};

test("a saved light or dark choice applies before rendering", () => {
  assert.equal(resolveInitialTheme("light", true), "light");
  assert.equal(resolveInitialTheme("dark", false), "dark");
});

test("light is the default regardless of device settings", () => {
  assert.equal(resolveInitialTheme(null, true), "light");
  assert.equal(resolveInitialTheme(null, false), "light");
  assert.equal(resolveInitialTheme("invalid", true), "light");
  assert.equal(resolveInitialTheme("system", true), "light");
});

test("blocked storage does not prevent the page from loading", () => {
  assert.equal(resolveInitialTheme(null, true, true), "light");
  assert.equal(resolveInitialTheme(null, false, true), "light");
});
