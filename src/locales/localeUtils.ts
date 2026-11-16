import { DEFAULT_LANGUAGE, LANGUAGE_CONFIG } from "./config.ts";
import type { Language, TranslationValues } from "../types/locale.types";

const isSupportedLanguage = (value: unknown): value is Language =>
  typeof value === "string" && Object.hasOwn(LANGUAGE_CONFIG, value);

export const resolveLanguage = (savedLanguage: unknown): Language =>
  isSupportedLanguage(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;

export const translateMessage = (
  catalog: Readonly<Record<string, string>>,
  fallback: Readonly<Record<string, string>>,
  message: string,
  values: TranslationValues = {},
): string => {
  const translated = Object.hasOwn(catalog, message)
    ? catalog[message]
    : Object.hasOwn(fallback, message)
      ? fallback[message]
      : message;
  return translated.replace(/\{(\w+)\}/g, (placeholder: string, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : placeholder,
  );
};

export const readLanguagePreference = (
  readPreference: () => unknown,
): Language => {
  try {
    return resolveLanguage(readPreference());
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

export const formatMemberCountMessage = (
  catalog: Readonly<Record<string, string>>,
  fallback: Readonly<Record<string, string>>,
  count: number,
  locale: string,
): string => {
  const category = new Intl.PluralRules(locale).select(count);
  return translateMessage(
    catalog,
    fallback,
    category === "one" ? "members.count.one" : "members.count.other",
    {
      count: new Intl.NumberFormat(locale).format(count),
    },
  );
};

export const applyLocaleMetadata = (
  document: Document,
  language: Language,
  metadata: { direction: "ltr" | "rtl"; title: string; description: string },
): void => {
  document.documentElement.lang = language;
  document.documentElement.dir = metadata.direction;
  document.title = metadata.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", metadata.description);
};
