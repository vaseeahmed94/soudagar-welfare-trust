import { useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { LANGUAGE_STORAGE_KEY, LANGUAGE_CONFIG } from "./config";
import { TRANSLATIONS } from "./catalogs";
import type {
  Language,
  TranslationValues,
  TranslationKey,
  Translate,
} from "../types/locale.types";
import {
  readLanguagePreference,
  translateMessage,
  applyLocaleMetadata,
  formatMemberCountMessage,
} from "./localeUtils";
import { LocaleContext } from "./localeContext";

const readLanguage = (): Language =>
  readLanguagePreference(() => localStorage.getItem(LANGUAGE_STORAGE_KEY));

const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(readLanguage);

  const languageConfig = LANGUAGE_CONFIG[language];

  useLayoutEffect(() => {
    applyLocaleMetadata(document, language, {
      direction: languageConfig.direction,
      title: `${TRANSLATIONS[language]["brand.name"]} | ${TRANSLATIONS[language]["brand.values"]}`,
      description: TRANSLATIONS[language]["meta.description"],
    });
  }, [language, languageConfig.direction]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY || event.key === null)
        setLanguage(readLanguage());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // The language remains available for this visit if storage is blocked.
    }
  };

  const t: Translate = (
    message: TranslationKey,
    values?: TranslationValues,
  ): string =>
    translateMessage(TRANSLATIONS[language], TRANSLATIONS.en, message, values);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(languageConfig.locale).format(value);
  const formatMemberCount = (count: number) =>
    formatMemberCountMessage(
      TRANSLATIONS[language],
      TRANSLATIONS.en,
      count,
      languageConfig.locale,
    );

  return (
    <LocaleContext.Provider
      value={{
        language,
        setLanguage: updateLanguage,
        t,
        formatNumber,
        formatMemberCount,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export default LocaleProvider;
