import { appConfig } from "../config/appConfig";

export interface DonationApplication {
  name: string;
  email: string;
  phone: string;
  amount: string;
}

export const submitDonationApplication = async (
  application: DonationApplication,
): Promise<void> => {
  if (!appConfig.googleScriptUrl)
    throw new Error("Donation service is currently unavailable.");
  const response = await fetch(appConfig.googleScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify({ type: "donation", ...application }),
  });
  if (!response.ok) throw new Error("Donation request failed.");
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
  };
  if (!result.success)
    throw new Error(result.message || "Donation request failed.");
};
