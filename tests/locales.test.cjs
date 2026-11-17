const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  resolveLanguage,
  translateMessage,
  readLanguagePreference,
  formatMemberCountMessage,
  applyLocaleMetadata,
} = require("../src/locales/localeUtils.ts");
const {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} = require("../src/locales/config.ts");
const { getMembershipErrorKey } = require("../src/locales/membershipErrors.ts");
const english = require("../src/locales/en.json");
const kannada = require("../src/locales/kn.json");
const catalogs = { en: english, kn: kannada };

test("English is the default, followed by Kannada", () => {
  assert.equal(DEFAULT_LANGUAGE, "en");
  assert.deepEqual(
    SUPPORTED_LANGUAGES.map(({ code }) => code),
    ["en", "kn"],
  );
  for (const value of [null, undefined, "", "en", "ur", "invalid", "__proto__"])
    assert.equal(resolveLanguage(value), "en");
  assert.equal(resolveLanguage("hi"), "en");
  assert.equal(resolveLanguage("kn"), "kn");
});

test("catalogs have matching semantic keys, text, and interpolation placeholders", () => {
  for (const [language, catalog] of Object.entries(catalogs)) {
    assert.deepEqual(
      Object.keys(catalog).sort(),
      Object.keys(english).sort(),
      language,
    );
    for (const [key, translation] of Object.entries(catalog)) {
      assert.match(key, /^[a-z]+(?:\.[a-zA-Z]+)+$/);
      assert.ok(translation.trim(), `Missing ${language} text: ${key}`);
      assert.deepEqual(
        (translation.match(/\{\w+\}/g) ?? []).sort(),
        (english[key].match(/\{\w+\}/g) ?? []).sort(),
        `${language}: ${key}`,
      );
    }
  }
});

test("messages fall back to English without interpreting inherited object properties", () => {
  assert.equal(translateMessage({}, english, "members.heading"), "Our Members");
  assert.equal(
    translateMessage(kannada, english, "members.heading"),
    "ನಮ್ಮ ಸದಸ್ಯರು",
  );
  assert.equal(
    translateMessage(kannada, english, "settings.languageSelection", {
      language: "ಕನ್ನಡ",
    }),
    "ಭಾಷೆ: ಕನ್ನಡ",
  );
  assert.equal(translateMessage({}, english, "missing.key"), "missing.key");
  assert.equal(translateMessage({}, english, "__proto__"), "__proto__");
});

test("saved language preferences are honored and inaccessible storage falls back to English", () => {
  assert.equal(
    readLanguagePreference(() => "hi"),
    "en",
  );
  assert.equal(
    readLanguagePreference(() => "kn"),
    "kn",
  );
  assert.equal(
    readLanguagePreference(() => "invalid"),
    "en",
  );
  assert.equal(
    readLanguagePreference(() => {
      throw new Error("Storage blocked");
    }),
    "en",
  );
});

test("member totals use language-appropriate plurals and Indian number formatting", () => {
  assert.equal(
    formatMemberCountMessage(english, english, 0, "en-IN"),
    "0 community members",
  );
  assert.equal(
    formatMemberCountMessage(english, english, 1, "en-IN"),
    "1 community member",
  );
  assert.equal(
    formatMemberCountMessage(english, english, 123456, "en-IN"),
    "1,23,456 community members",
  );
  assert.equal(
    formatMemberCountMessage(kannada, english, 1, "kn-IN"),
    "1 ಸಮುದಾಯ ಸದಸ್ಯರು",
  );
  assert.equal(
    formatMemberCountMessage(kannada, english, 2, "kn-IN"),
    "2 ಸಮುದಾಯ ಸದಸ್ಯರು",
  );
});

test("language changes update the document language, direction, title, and description", () => {
  const attributes = {};
  const document = {
    documentElement: {},
    title: "",
    querySelector: (selector) =>
      selector === 'meta[name="description"]'
        ? {
            setAttribute: (name, value) => {
              attributes[name] = value;
            },
          }
        : null,
  };
  for (const [language, messages] of Object.entries(catalogs)) {
    applyLocaleMetadata(document, language, {
      direction: "ltr",
      title: messages["brand.name"],
      description: messages["meta.description"],
    });
    assert.equal(document.documentElement.lang, language);
    assert.equal(document.documentElement.dir, "ltr");
    assert.equal(document.title, messages["brand.name"]);
    assert.equal(attributes.content, messages["meta.description"]);
  }
});

test("known legacy registration errors use locale keys and unknown errors get a translated fallback", () => {
  assert.equal(
    getMembershipErrorKey(new Error("Please provide a valid email address.")),
    "membership.errors.email",
  );
  for (const error of [
    new Error("Unknown backend message"),
    {},
    null,
    "__proto__",
  ]) {
    const key = getMembershipErrorKey(error);
    assert.equal(key, "membership.errors.submit");
    assert.ok(kannada[key]);
  }
});
