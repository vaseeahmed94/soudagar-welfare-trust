import LanguageSwitcher from "../common/LanguageSwitcher";
import { useLocale } from "../../hooks/useLocale";
import { useState } from "react";
import {
  ChevronDown,
  Heart,
  Mail,
  MapPin,
  Menu,
  Phone,
  Users,
  X,
} from "lucide-react";
import { appConfig } from "../../config/appConfig";
import { NAVIGATION } from "../../constants/navigation";
import ThemeSwitcher from "../common/ThemeSwitcher";
import Logo from "../common/Logo";

interface SiteHeaderProps {
  onJoin: () => void;
}

const SiteHeader = ({ onJoin }: SiteHeaderProps) => {
  const { t } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <div className="topbar relative z-20">
        <div className="topbar-inner container">
          <div className="contact-links">
            <span>
              <MapPin /> {t("contact.location")}
            </span>
            <a href={appConfig.contactEmailUrl}>
              <Mail /> {appConfig.contactEmail}
            </a>
            <a href={appConfig.contactPhoneUrl}>
              <Phone /> {appConfig.contactPhone}
            </a>
          </div>
          <span className="topbar-motto">
            {t("brand.motto")} <Heart />
          </span>
          <LanguageSwitcher />
        </div>
      </div>
      <header className="header">
        <div className="header-inner container">
          <Logo />
          <div className="order-2 ml-auto flex items-center gap-2.5 max-[800px]:order-0 max-[800px]:gap-2">
            <ThemeSwitcher />
            <button
              className="menu-toggle"
              aria-label={t(
                isMenuOpen ? "navigation.closeMenu" : "navigation.openMenu",
              )}
              aria-expanded={isMenuOpen}
              aria-controls="navigation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
          <nav
            id="navigation"
            aria-label={t("navigation.label")}
            className={isMenuOpen ? "navigation open" : "navigation"}
          >
            {NAVIGATION.map(({ labelKey, sectionId }, navigationIndex) => (
              <a
                className={navigationIndex === 0 ? "nav-home" : ""}
                key={sectionId}
                href={`#${sectionId}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t(labelKey)}
                {sectionId === "members" && <ChevronDown size={13} />}
              </a>
            ))}
            <button
              className="button button-green header-join"
              onClick={() => {
                setIsMenuOpen(false);
                onJoin();
              }}
            >
              <Users size={17} /> {t("common.joinCommunity")}
            </button>
          </nav>
        </div>
      </header>
    </>
  );
};

export default SiteHeader;
