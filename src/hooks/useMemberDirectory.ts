import { useEffect, useState } from "react";
import { fetchMemberDirectory } from "../services/membershipService";
import type {
  MemberDirectory,
  MemberLoadStatus,
} from "../types/membership.types";

export const useMemberDirectory = () => {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [memberDirectory, setMemberDirectory] =
    useState<MemberDirectory | null>(null);
  const [memberLoadStatus, setMemberLoadStatus] =
    useState<MemberLoadStatus>("loading");

  useEffect(() => {
    const abortController = new AbortController();
    let isActive = true;
    setMemberDirectory(null);
    setMemberLoadStatus("loading");
    const timeoutId = window.setTimeout(() => abortController.abort(), 15_000);
    fetchMemberDirectory(abortController.signal)
      .then((result) => {
        if (isActive) {
          setMemberDirectory(result);
          setMemberLoadStatus("ready");
        }
      })
      .catch(() => {
        if (isActive) {
          setMemberDirectory(null);
          setMemberLoadStatus("error");
        }
      })
      .finally(() => window.clearTimeout(timeoutId));
    return () => {
      isActive = false;
      abortController.abort();
      window.clearTimeout(timeoutId);
    };
  }, [refreshVersion]);

  return {
    memberDirectory,
    memberLoadStatus,
    refreshMembers: () => setRefreshVersion((value) => value + 1),
  };
};
