import { useLocale } from "../../hooks/useLocale";
import Spinner from "../common/Spinner";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { MemberDirectory } from "../../types/membership.types";
import type { MemberLoadStatus } from "../../types/membership.types";
import MemberAvatar from "../common/MemberAvatar";

interface MembersDirectoryProps {
  memberDirectory: MemberDirectory | null;
  memberLoadStatus: MemberLoadStatus;
  onRefreshMembers: () => void;
  onJoin: () => void;
}

const MembersDirectory = ({
  memberDirectory,
  memberLoadStatus,
  onRefreshMembers,
  onJoin,
}: MembersDirectoryProps) => {
  const { t, formatMemberCount } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const members = memberDirectory?.members ?? [];
  const pageCount = Math.max(1, Math.ceil(members.length / pageSize));
  const visibleMembers = members.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => setCurrentPage(1), [memberDirectory?.members]);
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  return (
    <>
      <span className="eyebrow">{t("members.eyebrow")}</span>
      <h2 id="modal-title">{t("members.directoryTitle")}</h2>
      {memberDirectory && (
        <p>
          <strong>{formatMemberCount(memberDirectory.totalCount)}</strong>
        </p>
      )}
      <div
        className="member-directory my-6 grid gap-x-3.5 gap-y-[22px]"
        aria-busy={memberLoadStatus === "loading"}
      >
        {memberLoadStatus === "loading" && (
          <div
            className="col-span-full flex min-h-40 flex-col items-center justify-center gap-3.5 text-sm text-muted"
            role="status"
          >
            <Spinner />
            <span>{t("members.loading")}</span>
          </div>
        )}
        {visibleMembers.map((member, index) => (
          <MemberAvatar
            key={`${(currentPage - 1) * pageSize + index}-${member.name}`}
            member={member}
          />
        ))}
      </div>
      {memberDirectory && members.length > pageSize && (
        <nav
          className="member-pagination"
          aria-label={t("members.paginationLabel")}
        >
          <button
            className="member-page-button"
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            aria-label={t("members.previousPage")}
          >
            <ChevronLeft size={17} aria-hidden="true" />
            <span>{t("members.previousPage")}</span>
          </button>
          <span className="member-page-indicator" aria-live="polite">
            {t("members.page", { current: currentPage, total: pageCount })}
          </span>
          <button
            className="member-page-button"
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(pageCount, page + 1))
            }
            disabled={currentPage === pageCount}
            aria-label={t("members.nextPage")}
          >
            <span>{t("members.nextPage")}</span>
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </nav>
      )}
      {memberLoadStatus === "error" && (
        <p role="status">
          {t("members.unavailable")}{" "}
          <button className="text-link" onClick={onRefreshMembers}>
            {t("common.retry")}
          </button>
        </p>
      )}
      {memberDirectory && memberDirectory.members.length === 0 && (
        <p>{t("members.empty")}</p>
      )}
      <p className="form-note">{t("members.directoryPrivacy")}</p>
      <button className="button button-green" onClick={onJoin}>
        {t("common.becomeMember")} <ArrowRight size={16} />
      </button>
    </>
  );
};

export default MembersDirectory;
