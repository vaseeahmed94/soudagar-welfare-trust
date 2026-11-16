import { useEffect, useState } from "react";
import { loadMembers, type MemberDirectory } from "../services/membership";

export function useMembers() {
  const [revision, setRevision] = useState(0);
  const [directory, setDirectory] = useState<MemberDirectory | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setDirectory(null);
    setStatus("loading");
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    loadMembers(controller.signal)
      .then((result) => {
        if (active) {
          setDirectory(result);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) {
          setDirectory(null);
          setStatus("error");
        }
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [revision]);

  return {
    directory,
    status,
    refresh: () => setRevision((value) => value + 1),
  };
}
