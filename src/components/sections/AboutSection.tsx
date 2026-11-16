import { useLocale } from "../../hooks/useLocale";
import { ArrowRight, CheckCircle2, HeartHandshake, Sprout } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";
import type { Dispatch, SetStateAction } from "react";
import type { ModalState } from "../../types/modal.types";

interface AboutSectionProps {
  onModalChange: Dispatch<SetStateAction<ModalState>>;
}

const AboutSection = ({ onModalChange }: AboutSectionProps) => {
  const { t } = useLocale();
  return (
    <section className="about" id="about">
      <img
        className="about-image"
        src={getImageUrl("hands-seedling")}
        alt={t("about.imageAlt")}
      />
      <div className="about-copy">
        <span className="eyebrow">{t("about.eyebrow")}</span>
        <h2>{t("about.heading")}</h2>
        <p>{t("about.description")}</p>
        <ul className="mission-list">
          <li>
            <CheckCircle2 /> {t("about.educationMission")}
          </li>
          <li>
            <CheckCircle2 /> {t("about.welfareMission")}
          </li>
          <li>
            <CheckCircle2 /> {t("about.harmonyMission")}
          </li>
        </ul>
        <button
          className="button button-outline"
          onClick={() => onModalChange({ kind: "activity", index: 2 })}
        >
          {t("about.missionAction")} <ArrowRight size={15} />
        </button>
      </div>
      <aside className="quote-card">
        <span className="quote-symbol">“</span>
        <blockquote>{t("about.quote")}</blockquote>
        <div className="quote-signature">
          <span />
          <HeartHandshake />
          <span />
        </div>
        <Sprout className="quote-leaf" aria-hidden="true" />
      </aside>
    </section>
  );
};

export default AboutSection;
