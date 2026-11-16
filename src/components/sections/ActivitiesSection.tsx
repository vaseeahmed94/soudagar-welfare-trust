import { useLocale } from "../../hooks/useLocale";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";
import { ACTIVITIES } from "../../constants/activities";
import type { Dispatch, SetStateAction } from "react";
import type { ModalState } from "../../types/modal.types";

interface ActivitiesSectionProps {
  onModalChange: Dispatch<SetStateAction<ModalState>>;
}

const ActivitiesSection = ({ onModalChange }: ActivitiesSectionProps) => {
  const { t } = useLocale();
  return (
    <section className="activities" id="activities">
      <div className="section-heading">
        <h2>{t("activities.heading")}</h2>
        <p>{t("activities.description")}</p>
      </div>
      <div className="activity-grid grid grid-cols-5 gap-5">
        {ACTIVITIES.map((activity, index) => (
          <article className="activity-card" key={activity.titleKey}>
            <img
              src={getImageUrl(activity.image)}
              alt={t(activity.titleKey)}
              loading="lazy"
            />
            <span className="activity-icon">
              <activity.icon size={23} />
            </span>
            <div className="activity-copy">
              <h3>{t(activity.titleKey)}</h3>
              <p>{t(activity.subtitleKey)}</p>
              <button
                className="text-link"
                onClick={() => onModalChange({ kind: "activity", index })}
                aria-label={`Learn more about ${t(activity.titleKey)}`}
              >
                {t("common.learnMore")} <ArrowRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ActivitiesSection;
