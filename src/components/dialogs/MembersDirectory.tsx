import { useLocale } from "../../hooks/useLocale";
import Spinner from "../common/Spinner";
import { ArrowRight } from "lucide-react";
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
        className="member-directory my-6 grid grid-cols-3 gap-x-3.5 gap-y-[22px] max-[540px]:grid-cols-2"
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
        {memberDirectory?.members.map((member, index) => (
          <MemberAvatar key={`${index}-${member.name}`} member={member} />
        ))}
      </div>
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
