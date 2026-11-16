import { BookOpen, Utensils, Sprout, HeartPulse, Gift } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TranslationKey } from "../types/locale.types";

interface Activity {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  image: string;
  icon: LucideIcon;
  detailKey: TranslationKey;
}

export const ACTIVITIES = [
  {
    titleKey: "activities.education.title",
    subtitleKey: "activities.education.subtitle",
    image: "education",
    icon: BookOpen,
    detailKey: "activities.education.detail",
  },
  {
    titleKey: "activities.social.title",
    subtitleKey: "activities.social.subtitle",
    image: "food",
    icon: Utensils,
    detailKey: "activities.social.detail",
  },
  {
    titleKey: "activities.community.title",
    subtitleKey: "activities.community.subtitle",
    image: "hands-seedling",
    icon: Sprout,
    detailKey: "activities.community.detail",
  },
  {
    titleKey: "activities.health.title",
    subtitleKey: "activities.health.subtitle",
    image: "health",
    icon: HeartPulse,
    detailKey: "activities.health.detail",
  },
  {
    titleKey: "activities.charity.title",
    subtitleKey: "activities.charity.subtitle",
    image: "volunteers",
    icon: Gift,
    detailKey: "activities.charity.detail",
  },
] as const satisfies readonly Activity[];
