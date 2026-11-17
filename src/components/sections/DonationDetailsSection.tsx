import { Check, Copy, HeartHandshake, X } from "lucide-react";
import { useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import donationQr from "../../assets/images/swt-donation-qr.jpeg";

interface DonationDetailsSectionProps {
  onDonate: () => void;
}

const DonationDetailsSection = ({ onDonate }: DonationDetailsSectionProps) => {
  const { t } = useLocale();
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(t("donation.upiId"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="donation-details" aria-labelledby="donation-heading">
      <div className="donation-details-copy">
        <HeartHandshake className="donation-details-icon" aria-hidden="true" />
        <span className="eyebrow">{t("donation.eyebrow")}</span>
        <h2 id="donation-heading">{t("donation.heading")}</h2>
        <strong>{t("donation.amount")}</strong>
        <p>{t("donation.message")}</p>
      </div>
      <div className="donation-details-action">
        <div className="donation-payment-details">
          <button
            className="donation-qr-button"
            type="button"
            onClick={() => setIsQrExpanded(true)}
            aria-label="Open QR code in a larger view"
          >
            <img src={donationQr} alt={t("donation.qrAlt")} />
          </button>
          <div className="donation-upi-copy">
            <span>{t("donation.upiLabel")}</span>
            <strong>{t("donation.upiId")}</strong>
            <button
              className="donation-copy-button"
              type="button"
              onClick={copyUpi}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? t("donation.copied") : t("donation.copyUpi")}
            </button>
          </div>
        </div>
        <button
          className="button button-gold donation-open-button"
          type="button"
          onClick={onDonate}
        >
          {t("donation.openForm")}
        </button>
      </div>
      {isQrExpanded && (
        <div
          className="donation-qr-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged donation QR code"
          onClick={() => setIsQrExpanded(false)}
        >
          <button
            className="donation-qr-close"
            type="button"
            onClick={() => setIsQrExpanded(false)}
            aria-label="Close enlarged QR code"
          >
            <X size={22} />
          </button>
          <img
            src={donationQr}
            alt={t("donation.qrAlt")}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default DonationDetailsSection;
