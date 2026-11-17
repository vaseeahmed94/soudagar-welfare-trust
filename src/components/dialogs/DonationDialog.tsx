import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Copy, HeartHandshake } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import { submitDonationApplication } from "../../services/donationService";
import donationQr from "../../assets/images/donation-qr.png";

const DonationDialog = () => {
  const { t } = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => {
      const field = data.get(name);
      return typeof field === "string" ? field.trim() : "";
    };
    setPending(true);
    setError("");
    try {
      await submitDonationApplication({
        name: value("name"),
        email: value("email"),
        phone: value("phone"),
        amount: "30",
      });
      setSubmitted(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : t("donation.error"),
      );
    } finally {
      setPending(false);
    }
  };

  const copyUpi = async () => {
    await navigator.clipboard.writeText(t("donation.upiId"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (submitted) {
    return (
      <div className="donation-dialog-content">
        <HeartHandshake className="donation-dialog-icon" aria-hidden="true" />
        <span className="eyebrow">{t("donation.thankYouEyebrow")}</span>
        <h2 id="modal-title">{t("donation.thankYouHeading")}</h2>
        <p>{t("donation.thankYouMessage")}</p>
        <div className="donation-dialog-payment">
          <img src={donationQr} alt={t("donation.qrAlt")} />
          <div>
            <span>{t("donation.upiLabel")}</span>
            <strong>{t("donation.upiId")}</strong>
            <button className="text-link" type="button" onClick={copyUpi}>
              <Copy size={14} />{" "}
              {copied ? t("donation.copied") : t("donation.copyUpi")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donation-dialog-content">
      <span className="eyebrow">{t("donation.eyebrow")}</span>
      <h2 id="modal-title">{t("donation.formHeading")}</h2>
      <p>{t("donation.formDescription")}</p>
      <div className="donation-dialog-amount">{t("donation.amount")}</div>
      <form className="donation-form" onSubmit={handleSubmit}>
        <label>
          {t("membership.nameLabel")}
          <input
            name="name"
            required
            maxLength={100}
            placeholder={t("membership.namePlaceholder")}
          />
        </label>
        <label>
          {t("membership.emailLabel")}
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder={t("membership.emailPlaceholder")}
          />
        </label>
        <label>
          {t("membership.phoneLabel")}
          <input
            name="phone"
            required
            maxLength={20}
            placeholder={t("membership.phonePlaceholder")}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="button button-green"
          type="submit"
          disabled={pending}
        >
          {pending ? t("donation.submitting") : t("donation.continue")}{" "}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
};

export default DonationDialog;
