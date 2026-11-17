import { useLocale } from "../../hooks/useLocale";
import Spinner from "../common/Spinner";
import { ArrowRight } from "lucide-react";
import MemberAvatar from "../common/MemberAvatar";
import type { Dispatch, SetStateAction } from "react";
import type { ModalState } from "../../types/modal.types";
import type { MemberDirectory } from "../../types/membership.types";
import type { MemberLoadStatus } from "../../types/membership.types";

interface MembersSectionProps {
  memberDirectory: MemberDirectory | null;
  memberLoadStatus: MemberLoadStatus;
  onRefreshMembers: () => void;
  onModalChange: Dispatch<SetStateAction<ModalState>>;
}

const MembersSection = ({
  memberDirectory,
  memberLoadStatus,
  onRefreshMembers,
  onModalChange,
}: MembersSectionProps) => {
  const { t, formatNumber } = useLocale();
  return (
    <section className="members" id="members">
      <div className="small-heading">
        <h2>{t("members.heading")}</h2>
        <p>{t("members.description")}</p>
      </div>
      <div
        className="member-portraits"
        aria-busy={memberLoadStatus === "loading"}
      >
        {memberDirectory?.members.slice(0, 3).map((member, index) => (
          <MemberAvatar key={`${index}-${member.name}`} member={member} />
        ))}
        <div className="member-count">
          {memberLoadStatus === "loading" ? (
            <Spinner inverse />
          ) : (
            <strong>
              {memberDirectory ? formatNumber(memberDirectory.totalCount) : "—"}
            </strong>
          )}
          <span>{t("members.label")}</span>
        </div>
      </div>
      {memberLoadStatus === "loading" && (
        <p className="member-status member-loading" role="status">
          {t("members.loading")}
        </p>
      )}
      {memberLoadStatus === "error" && (
        <p className="member-status" role="status">
          {t("members.unavailable")}{" "}
          <button className="text-link" onClick={onRefreshMembers}>
            {t("common.retry")}
          </button>
        </p>
      )}
      {memberDirectory && memberDirectory.members.length === 0 && (
        <p className="member-status">{t("members.publicProfilesNote")}</p>
      )}
      <p className="member-privacy-note">{t("members.privacy")}</p>
      <button
        className="button button-green button-small"
        onClick={() => onModalChange({ kind: "members" })}
      >
        {t("members.viewAll")} <ArrowRight size={15} />
      </button>
      <button
        className="button button-outline button-small"
        onClick={() => onModalChange({ kind: "contributions" })}
      >
        View my contributions <ArrowRight size={15} />
      </button>
    </section>
  );
};

export default MembersSection;
