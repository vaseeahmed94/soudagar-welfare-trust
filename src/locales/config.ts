import type { Language } from "../types/locale.types";

export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "swt-language";
export const LANGUAGE_CONFIG = {
  en: { label: "English", locale: "en-IN", direction: "ltr" },
  hi: { label: "हिन्दी", locale: "hi-IN", direction: "ltr" },
} as const satisfies Record<
  Language,
  { label: string; locale: string; direction: "ltr" | "rtl" }
>;
export const SUPPORTED_LANGUAGES = [
  { code: "en", ...LANGUAGE_CONFIG.en },
  { code: "hi", ...LANGUAGE_CONFIG.hi },
] as const;
