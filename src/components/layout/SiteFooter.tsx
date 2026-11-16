import { useLocale } from "../../hooks/useLocale";
import { Heart, Mail, Phone, Users } from "lucide-react";
import { appConfig } from "../../config/appConfig";
import { NAVIGATION } from "../../constants/navigation";
import Logo from "../common/Logo";
import type { Dispatch, SetStateAction } from "react";
import type { ModalState } from "../../types/modal.types";

interface SiteFooterProps {
  onJoin: () => void;
  onModalChange: Dispatch<SetStateAction<ModalState>>;
}

const SiteFooter = ({ onJoin, onModalChange }: SiteFooterProps) => {
  const { t } = useLocale();
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-main">
          <Logo light />
          <div className="footer-links">
            <h3>{t("footer.quickLinks")}</h3>
            <div>
              {NAVIGATION.map(({ labelKey, sectionId }) => (
                <a key={sectionId} href={`#${sectionId}`}>
                  {t(labelKey)}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-social">
            <h3>{t("footer.contactHeading")}</h3>
            <div>
              <a
                className="social youtube"
                href={appConfig.contactEmailUrl}
                aria-label={t("footer.emailLabel")}
              >
                <Mail />
              </a>
              <a
                className="social whatsapp"
                href={appConfig.contactPhoneUrl}
                aria-label={t("footer.phoneLabel")}
              >
                <Phone />
              </a>
              <button
                className="social facebook"
                onClick={onJoin}
                aria-label={t("footer.joinLabel")}
              >
                <Users />
              </button>
              <a
                className="social social-heart"
                href="#activities"
                aria-label={t("footer.exploreLabel")}
              >
                <Heart />
              </a>
            </div>
          </div>
          <p className="footer-motto">
            {t("brand.motto")}{" "}
            <Heart size={14} fill="#d44640" color="#d44640" />
          </p>
        </div>
        <div className="footer-bottom">
          <span>
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </span>
          <div>
            <button onClick={() => onModalChange({ kind: "privacy" })}>
              {t("privacy.heading")}
            </button>
            <span>|</span>
            <button onClick={() => onModalChange({ kind: "terms" })}>
              {t("terms.heading")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
