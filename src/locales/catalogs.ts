import english from "./en.json";
import hindi from "./hi.json";
import type { Language, TranslationKey } from "../types/locale.types";

export const TRANSLATIONS = {
  en: english,
  hi: hindi,
} satisfies Record<Language, Record<TranslationKey, string>>;
