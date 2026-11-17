import { HeartHandshake } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import donationQr from "../../assets/images/donation-qr.png";

interface DonationDetailsSectionProps {
  onDonate: () => void;
}

const DonationDetailsSection = ({ onDonate }: DonationDetailsSectionProps) => {
  const { t } = useLocale();

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
          <img src={donationQr} alt={t("donation.qrAlt")} />
          <div>
            <span>{t("donation.upiLabel")}</span>
            <strong>{t("donation.upiId")}</strong>
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
    </section>
  );
};

export default DonationDetailsSection;
