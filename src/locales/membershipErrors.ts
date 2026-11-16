import type { TranslationKey } from "../types/locale.types";

// Existing Apps Script deployments return English messages rather than codes.
const MEMBERSHIP_ERROR_KEYS: Readonly<Record<string, TranslationKey>> = {
  "Registration is currently unavailable. Please contact the trust.":
    "membership.errors.unavailable",
  "The registration service could not process your request. Please contact the trust.":
    "membership.errors.requestFailed",
  "The service did not return a registration confirmation. Please contact the trust before submitting again.":
    "membership.errors.unconfirmed",
  "Your application could not be submitted. Please contact the trust.":
    "membership.errors.failed",
  "We could not confirm your submission. Please check with the trust before submitting again.":
    "membership.errors.unconfirmedSubmission",
  "Unable to submit your application. Please contact the trust.":
    "membership.errors.submit",
  "Invalid request.": "membership.errors.invalidRequest",
  "Please provide your full name.": "membership.errors.name",
  "Please provide a valid email address.": "membership.errors.email",
  "Please provide a valid phone number.": "membership.errors.phone",
  "Please choose Yes or No for public profile consent.":
    "membership.errors.consent",
  "Registration is busy. Please try again shortly.": "membership.errors.busy",
  "This email is already registered. Contact the trust to update your details or consent.":
    "membership.errors.duplicate",
  "We could not confirm your registration. Please contact the trust before submitting again.":
    "membership.errors.unconfirmedRegistration",
};

export const getMembershipErrorKey = (error: unknown): TranslationKey => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return Object.hasOwn(MEMBERSHIP_ERROR_KEYS, message)
    ? MEMBERSHIP_ERROR_KEYS[message]
    : "membership.errors.submit";
};
