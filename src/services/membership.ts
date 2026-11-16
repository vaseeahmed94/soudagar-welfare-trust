import { config } from "../config";

export interface MembershipApplication {
  name: string;
  email: string;
  phone: string;
  publicConsent: boolean;
}

export async function submitMembership(
  application: MembershipApplication,
): Promise<void> {
  if (!config.googleScriptUrl) {
    throw new Error(
      "Registration is currently unavailable. Please contact the trust.",
    );
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(config.googleScriptUrl, {
      method: "POST",
      // A simple content type avoids a CORS preflight on Apps Script web apps.
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(application),
      redirect: "follow",
      credentials: "omit",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        "The registration service could not process your request. Please contact the trust.",
      );
    }

    const result: unknown = await response.json().catch(() => null);
    if (!result || typeof result !== "object" || !("success" in result)) {
      throw new Error(
        "The service did not return a registration confirmation. Please contact the trust before submitting again.",
      );
    }
    if (result.success !== true) {
      const message =
        "message" in result && typeof result.message === "string"
          ? result.message
          : "Your application could not be submitted. Please contact the trust.";
      throw new Error(message);
    }
  } catch (error) {
    if (controller.signal.aborted || error instanceof TypeError) {
      throw new Error(
        "We could not confirm your submission. Please check with the trust before submitting again.",
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export interface PublicMember {
  name: string;
}

export interface MemberDirectory {
  totalCount: number;
  members: PublicMember[];
}

export async function loadMembers(
  signal: AbortSignal,
): Promise<MemberDirectory> {
  if (!config.googleScriptUrl)
    throw new Error("Member service is not configured.");
  const url = new URL(config.googleScriptUrl);
  url.searchParams.set("action", "members");
  const response = await fetch(url, {
    signal,
    credentials: "omit",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Member service is unavailable.");
  const result: unknown = await response.json();
  if (
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    result.success !== true ||
    !("totalCount" in result) ||
    typeof result.totalCount !== "number" ||
    !Number.isSafeInteger(result.totalCount) ||
    result.totalCount < 0 ||
    !("members" in result) ||
    !Array.isArray(result.members)
  ) {
    throw new Error("Invalid member directory response.");
  }
  const members: PublicMember[] = [];
  for (const entry of result.members) {
    // Consent is enforced in Apps Script. Accept names only; reject older or
    // unexpected responses that include additional member details.
    if (
      !entry ||
      typeof entry !== "object" ||
      Array.isArray(entry) ||
      Object.keys(entry).length !== 1 ||
      typeof entry.name !== "string" ||
      !entry.name.trim()
    ) {
      throw new Error("The public directory must return member names only.");
    }
    members.push({ name: entry.name.trim() });
  }
  if (members.length > result.totalCount)
    throw new Error("Invalid member total.");
  return { totalCount: result.totalCount, members };
}
