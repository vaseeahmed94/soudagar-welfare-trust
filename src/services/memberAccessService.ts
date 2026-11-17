import { appConfig } from "../config/appConfig";

export interface ContributionRecord {
  month: string;
  amount: string;
  status: string;
  activity: string;
  createdAt: string;
}
export interface ActivityRecord {
  month: string;
  title: string;
  description: string;
  amountSpent: string;
  summaryFileUrl: string;
}
export interface MemberDetails {
  member: { name: string; email: string };
  contributions: ContributionRecord[];
  activities: ActivityRecord[];
  totals: {
    memberAmount: number;
    overallAmount: number;
    totalSpent: number;
    availableBalance: number;
  };
}

const call = async (
  payload: Record<string, string>,
): Promise<Record<string, unknown>> => {
  if (!appConfig.googleScriptUrl)
    throw new Error("Contribution access is temporarily unavailable.");
  const response = await fetch(appConfig.googleScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as Record<string, unknown>;
  if (!result.success)
    throw new Error(
      typeof result.message === "string" ? result.message : "Request failed.",
    );
  return result;
};

export const requestAccessCode = async (email: string) => {
  await call({ type: "requestAccessCode", email });
};
export const verifyAccessCode = async (email: string, code: string) => {
  const result = await call({ type: "verifyAccessCode", email, code });
  return String(result.token);
};
export const fetchMemberDetails = async (token: string) => {
  const result = await call({ type: "memberDetails", token });
  return result as unknown as MemberDetails;
};
