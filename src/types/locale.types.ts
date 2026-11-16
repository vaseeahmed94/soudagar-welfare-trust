import type english from "../locales/en.json";

export type Language = "en" | "hi" | "kn";
export type TranslationKey = keyof typeof english;
export type TranslationValues = Readonly<Record<string, string | number>>;

export interface TranslationParameters {
  "settings.languageSelection": { language: string };
  "activities.learnMoreLabel": { title: string };
  "gallery.imageLabel": { title: string };
  "testimonials.showLabel": { number: number };
  "membership.requiredNote": { marker: string };
  "privacy.contact": { email: string };
  "footer.copyright": { year: number };
  "members.count.one": { count: string };
  "members.count.other": { count: string };
}

export type Translate = <Key extends TranslationKey>(
  key: Key,
  ...args: Key extends keyof TranslationParameters
    ? [values: TranslationParameters[Key]]
    : []
) => string;
