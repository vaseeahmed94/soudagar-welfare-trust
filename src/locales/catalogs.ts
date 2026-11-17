import english from "./en.json";
import kannada from "./kn.json";
import type { Language, TranslationKey } from "../types/locale.types";

export const TRANSLATIONS = {
  en: english,
  kn: kannada,
} satisfies Record<Language, Record<TranslationKey, string>>;
