const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim();

if (!contactEmail) {
  throw new Error("Missing VITE_CONTACT_EMAIL. Set it in .env and restart Vite.");
}

const contactPhone = import.meta.env.VITE_CONTACT_PHONE?.trim();

if (!contactPhone) {
  throw new Error("Missing VITE_CONTACT_PHONE. Set it in .env and restart Vite.");
}

export const config = {
  contactPhone,
  contactPhoneUrl: `tel:${contactPhone.replace(/[\s().-]/g, "")}`,
  contactEmail,
  contactEmailUrl: `mailto:${contactEmail}`,
  googleScriptUrl: import.meta.env.VITE_GOOGLE_SCRIPT_URL?.trim() || undefined,
};
