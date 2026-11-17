import { HeartHandshake } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";

const DonationDetailsSection = () => {
  const { t } = useLocale();

  return (
    <section className="donation-details" aria-labelledby="donation-heading">
      <HeartHandshake className="donation-details-icon" aria-hidden="true" />
      <div>
        <span className="eyebrow">{t("donation.eyebrow")}</span>
        <h2 id="donation-heading">{t("donation.heading")}</h2>
        <strong>{t("donation.amount")}</strong>
        <p>{t("donation.message")}</p>
      </div>
    </section>
  );
};

export default DonationDetailsSection;
