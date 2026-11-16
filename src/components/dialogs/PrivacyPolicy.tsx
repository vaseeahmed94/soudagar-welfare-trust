import { useLocale } from "../../hooks/useLocale";
import { appConfig } from "../../config/appConfig";

const PrivacyPolicy = () => {
  const { t } = useLocale();
  return (
    <>
      <h2 id="modal-title">{t("privacy.heading")}</h2>
      <p>{t("privacy.membershipDetails")}</p>
      <p>{t("privacy.contact", { email: appConfig.contactEmail })}</p>
    </>
  );
};

export default PrivacyPolicy;
