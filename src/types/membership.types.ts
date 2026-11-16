export interface MembershipApplication {
  name: string;
  email: string;
  phone: string;
  publicConsent: boolean;
}

export interface PublicMember {
  name: string;
}

export interface MemberDirectory {
  totalCount: number;
  members: PublicMember[];
}

export type MemberLoadStatus = "loading" | "ready" | "error";
export type SubmissionStatus = "idle" | "submitting" | "success";
