import type { TranslationKey } from "../types/locale.types";

interface NavigationItem {
  labelKey: TranslationKey;
  sectionId: string;
}

export const NAVIGATION = [
  { labelKey: "navigation.home", sectionId: "home" },
  { labelKey: "navigation.about", sectionId: "about" },
  { labelKey: "navigation.activities", sectionId: "activities" },
  { labelKey: "navigation.members", sectionId: "members" },
  { labelKey: "navigation.gallery", sectionId: "gallery" },
  { labelKey: "navigation.contact", sectionId: "contact" },
] as const satisfies readonly NavigationItem[];

export const BACK_TO_TOP_THRESHOLD = 400;
