import { useLocale } from "../../hooks/useLocale";
import { ArrowRight, Play } from "lucide-react";

interface HeroSectionProps {
  onJoin: () => void;
}

const HeroSection = ({ onJoin }: HeroSectionProps) => {
  const { t } = useLocale();
  return (
    <section className="hero" id="home">
      <div className="hero-photo hero-people" />
      <div className="hero-photo hero-mosque" />
      <div className="hero-wash" />
      <div className="hero-content">
        <h1 id="page-title" tabIndex={-1} className="focus:outline-none">
          {t("brand.firstLine")}
          <br />
          {t("brand.secondLine")} <span>{t("brand.abbreviation")}</span>
        </h1>
        <p className="hero-values">
          {t("brand.humanity")} <b>•</b> {t("brand.service")} <b>•</b>{" "}
          {t("brand.unity")}
        </p>
        <p className="hero-motto">{t("hero.motto")}</p>
        <div className="hero-buttons">
          <button className="button button-green" onClick={onJoin}>
            {t("common.joinCommunity")} <ArrowRight size={16} />
          </button>
          <a className="button button-light" href="#about">
            <Play size={15} fill="currentColor" /> {t("common.learnMore")}
          </a>
        </div>
      </div>
      <svg
        className="hero-wave"
        viewBox="0 0 1440 65"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 40C270-15 600 90 1020 49c180-18 307-21 420-49v65H0Z"
          fill="#5B9D49"
        />
        <path
          d="M0 49C270-5 600 98 1020 57c180-18 307-21 420-47v55H0Z"
          fill="var(--color-page)"
        />
      </svg>
    </section>
  );
};

export default HeroSection;
