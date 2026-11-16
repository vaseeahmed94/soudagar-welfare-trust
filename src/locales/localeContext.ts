import { createContext } from "react";
import type { Language, Translate } from "../types/locale.types";

interface LocaleContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
  formatNumber: (value: number) => string;
  formatMemberCount: (count: number) => string;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
