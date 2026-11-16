import type { TranslationKey } from "../../types/locale.types";
import { useLocale } from "../../hooks/useLocale";
import type { SubmissionStatus } from "../../types/membership.types";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { FormEvent } from "react";

interface MembershipFormProps {
  submissionStatus: SubmissionStatus;
  submissionErrorKey: TranslationKey | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onClose: () => void;
}

const MembershipForm = ({
  submissionStatus,
  submissionErrorKey,
  onSubmit,
  onClose,
}: MembershipFormProps) => {
  const { t } = useLocale();
  return (
    <>
      <span className="eyebrow">{t("brand.name")}</span>
      <h2 id="modal-title" tabIndex={-1}>
        {t("membership.heading")}
      </h2>
      {submissionStatus !== "success" && (
        <>
          <p className="join-introduction" id="join-introduction">
            {t("membership.introduction")}
          </p>
          <p className="required-note">
            {t("membership.requiredNote", { marker: "*" })}
          </p>
        </>
      )}
      {submissionStatus === "success" ? (
        <div className="enquiry-ready" role="status">
          <CheckCircle2 size={40} />
          <h3>{t("membership.successTitle")}</h3>
          <p>{t("membership.successMessage")}</p>
          <button className="button button-green" onClick={onClose}>
            {t("common.close")} <CheckCircle2 size={17} />
          </button>
        </div>
      ) : (
        <form
          aria-describedby="join-introduction"
          aria-busy={submissionStatus === "submitting"}
          onSubmit={onSubmit}
        >
          <fieldset
            className="membership-fields"
            disabled={submissionStatus === "submitting"}
          >
            <label>
              <span>
                {t("membership.nameLabel")} <span aria-hidden="true">*</span>
              </span>
              <input
                name="name"
                autoComplete="name"
                required
                placeholder={t("membership.namePlaceholder")}
                maxLength={100}
              />
            </label>
            <label>
              <span>
                {t("membership.emailLabel")} <span aria-hidden="true">*</span>
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t("membership.emailPlaceholder")}
              />
            </label>
            <label>
              <span>
                {t("membership.phoneLabel")} <span aria-hidden="true">*</span>
              </span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder={t("membership.phonePlaceholder")}
                minLength={7}
                maxLength={20}
              />
            </label>
            <fieldset className="consent-options">
              <legend>
                {t("membership.consentLegend")}{" "}
                <span aria-hidden="true">*</span>
              </legend>
              <label>
                <input type="radio" name="publicConsent" value="yes" required />
                <span>
                  <strong>{t("membership.consentYes")}</strong>
                </span>
              </label>
              <label>
                <input type="radio" name="publicConsent" value="no" required />
                <span>
                  <strong>{t("membership.consentNo")}</strong>
                </span>
              </label>
            </fieldset>
            <p className="form-note">{t("membership.dataUse")}</p>
            {submissionErrorKey && (
              <p className="form-error" role="alert">
                {t(submissionErrorKey)}
              </p>
            )}
            <button className="button button-green" type="submit">
              {submissionStatus === "submitting"
                ? t("membership.submitting")
                : t("membership.submit")}{" "}
              <ArrowRight size={16} />
            </button>
          </fieldset>
        </form>
      )}
    </>
  );
};

export default MembershipForm;
