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
const hindi = require("../src/locales/hi.json");

test("English is the default and Hindi is the second supported option", () => {
  assert.equal(DEFAULT_LANGUAGE, "en");
  assert.deepEqual(
    SUPPORTED_LANGUAGES.map(({ code }) => code),
    ["en", "hi"],
  );
  for (const value of [null, undefined, "", "en", "kn", "ur", "invalid"])
    assert.equal(resolveLanguage(value), "en");
  assert.equal(resolveLanguage("hi"), "hi");
});

test("catalogs have matching semantic keys, text, and interpolation placeholders", () => {
  assert.deepEqual(Object.keys(hindi).sort(), Object.keys(english).sort());
  for (const [key, translation] of Object.entries(hindi)) {
    assert.match(key, /^[a-z]+(?:\.[a-zA-Z]+)+$/);
    assert.ok(translation.trim(), `Missing Hindi text: ${key}`);
    assert.deepEqual(
      (translation.match(/\{\w+\}/g) ?? []).sort(),
      (english[key].match(/\{\w+\}/g) ?? []).sort(),
      key,
    );
  }
});

test("messages fall back to English without interpreting inherited object properties", () => {
  assert.equal(
    translateMessage(hindi, english, "members.heading"),
    "हमारे सदस्य",
  );
  assert.equal(translateMessage({}, english, "members.heading"), "Our Members");
  assert.equal(translateMessage(hindi, english, "missing.key"), "missing.key");
  assert.equal(translateMessage(hindi, english, "__proto__"), "__proto__");
  assert.equal(
    translateMessage(hindi, english, "testimonials.showLabel", { number: 2 }),
    "प्रशंसापत्र 2 दिखाएँ",
  );
});

test("saved language preferences are honored and inaccessible storage falls back to English", () => {
  assert.equal(
    readLanguagePreference(() => "hi"),
    "hi",
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
  assert.equal(formatMemberCountMessage(hindi, english, 1, "hi-IN"), "1 सदस्य");
  assert.equal(formatMemberCountMessage(hindi, english, 2, "hi-IN"), "2 सदस्य");
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
  for (const language of ["hi", "en"]) {
    const messages = language === "hi" ? hindi : english;
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
    assert.ok(hindi[key]);
  }
});
