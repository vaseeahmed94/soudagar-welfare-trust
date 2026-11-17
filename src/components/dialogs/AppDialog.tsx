import { getMembershipErrorKey } from "../../locales/membershipErrors";
import type { TranslationKey } from "../../types/locale.types";
import { useLocale } from "../../hooks/useLocale";
import type { SubmissionStatus } from "../../types/membership.types";
import MembershipForm from "./MembershipForm";
import ActivityDetails from "./ActivityDetails";
import MembersDirectory from "./MembersDirectory";
import GalleryLightbox from "./GalleryLightbox";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsAndConditions";
import WelcomeDialog from "./WelcomeDialog";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { submitMembershipApplication } from "../../services/membershipService";
import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { ModalState } from "../../types/modal.types";
import type { MemberDirectory } from "../../types/membership.types";
import type { MemberLoadStatus } from "../../types/membership.types";

interface AppDialogProps {
  activeModal: ModalState;
  onModalChange: Dispatch<SetStateAction<ModalState>>;
  onJoin: () => void;
  memberDirectory: MemberDirectory | null;
  memberLoadStatus: MemberLoadStatus;
  onRefreshMembers: () => void;
}

const AppDialog = ({
  activeModal,
  onModalChange,
  onJoin,
  memberDirectory,
  memberLoadStatus,
  onRefreshMembers,
}: AppDialogProps) => {
  const { t } = useLocale();
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("idle");
  const [submissionErrorKey, setSubmissionErrorKey] =
    useState<TranslationKey | null>(null);
  const isSubmissionPendingRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    if (activeModal) {
      if (!dialog?.open) dialog?.showModal();
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (dialog) dialog.scrollTop = 0;
      if (activeModal.kind === "join") {
        document.getElementById("modal-title")?.focus({ preventScroll: true });
      }
    } else {
      dialog?.close();
      setSubmissionStatus("idle");
      setSubmissionErrorKey(null);
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [activeModal]);
  const handleSubmitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmissionPendingRef.current) return;
    const data = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = data.get(name);
      return typeof value === "string" ? value.trim() : "";
    };
    isSubmissionPendingRef.current = true;
    setSubmissionStatus("submitting");
    setSubmissionErrorKey(null);
    try {
      await submitMembershipApplication({
        name: field("name"),
        email: field("email"),
        phone: field("phone"),
        publicConsent: field("publicConsent") === "yes",
      });
      setSubmissionStatus("success");
      onRefreshMembers();
    } catch (error) {
      setSubmissionErrorKey(getMembershipErrorKey(error));
      setSubmissionStatus("idle");
    } finally {
      isSubmissionPendingRef.current = false;
    }
  };
  return (
    <dialog
      ref={dialogRef}
      className={`modal ${activeModal?.kind === "gallery" ? "gallery-modal" : activeModal?.kind === "join" ? "join-modal" : activeModal?.kind === "welcome" ? "welcome-modal" : ""}`}
      onCancel={(event) => {
        if (isSubmissionPendingRef.current) event.preventDefault();
        else onModalChange(null);
      }}
      onClick={(event) => {
        if (
          event.target !== event.currentTarget ||
          isSubmissionPendingRef.current
        )
          return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const isOutside =
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom;
        if (isOutside) onModalChange(null);
      }}
      aria-labelledby="modal-title"
    >
      <button
        className="modal-close"
        aria-label={t("common.closeDialog")}
        disabled={submissionStatus === "submitting"}
        onClick={() => onModalChange(null)}
      >
        <X />
      </button>
      {activeModal?.kind === "join" && (
        <MembershipForm
          submissionStatus={submissionStatus}
          submissionErrorKey={submissionErrorKey}
          onSubmit={handleSubmitApplication}
          onClose={() => onModalChange(null)}
        />
      )}
      {activeModal?.kind === "welcome" && <WelcomeDialog />}
      {activeModal?.kind === "activity" && (
        <ActivityDetails index={activeModal.index} onJoin={onJoin} />
      )}
      {activeModal?.kind === "members" && (
        <MembersDirectory
          memberDirectory={memberDirectory}
          memberLoadStatus={memberLoadStatus}
          onRefreshMembers={onRefreshMembers}
          onJoin={onJoin}
        />
      )}
      {activeModal?.kind === "gallery" && (
        <GalleryLightbox
          index={activeModal.index}
          onModalChange={onModalChange}
        />
      )}
      {activeModal?.kind === "privacy" && <PrivacyPolicy />}
      {activeModal?.kind === "terms" && <TermsAndConditions />}
    </dialog>
  );
};

export default AppDialog;
