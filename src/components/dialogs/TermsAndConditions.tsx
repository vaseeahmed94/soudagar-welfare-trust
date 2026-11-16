import { useLocale } from "../../hooks/useLocale";
const TermsAndConditions = () => {
  const { t } = useLocale();
  return (
    <>
      <h2 id="modal-title">{t("terms.heading")}</h2>
      <p>{t("terms.websiteContent")}</p>
      <p>{t("terms.membershipDisclaimer")}</p>
    </>
  );
};

export default TermsAndConditions;
