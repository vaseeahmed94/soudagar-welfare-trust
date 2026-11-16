import type { Translate } from "../../src/types/locale.types";

declare const t: Translate;

t("members.heading");
t("privacy.contact", { email: "trust@example.com" });
t("testimonials.showLabel", { number: 2 });

// @ts-expect-error Unknown translation keys must fail type checking.
t("members.headng");
// @ts-expect-error Interpolated messages require their named values.
t("privacy.contact");
// @ts-expect-error Interpolation values must use the expected types.
t("testimonials.showLabel", { number: "two" });
// @ts-expect-error Messages without placeholders do not accept extra values.
t("members.heading", { unused: "value" });
