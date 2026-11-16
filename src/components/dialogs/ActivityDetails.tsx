import { useLocale } from "../../hooks/useLocale";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";
import { ACTIVITIES } from "../../constants/activities";

interface ActivityDetailsProps {
  index: number;
  onJoin: () => void;
}

const ActivityDetails = ({ index, onJoin }: ActivityDetailsProps) => {
  const { t } = useLocale();
  return (
    <>
      <img
        className="modal-cover"
        src={getImageUrl(ACTIVITIES[index].image)}
        alt={t(ACTIVITIES[index].titleKey)}
      />
      <span className="eyebrow">{t("brand.values")}</span>
      <h2 id="modal-title">{t(ACTIVITIES[index].titleKey)}</h2>
      <p>{t(ACTIVITIES[index].detailKey)}</p>
      <button className="button button-green" onClick={onJoin}>
        {t("common.getInvolved")} <ArrowRight size={16} />
      </button>
    </>
  );
};

export default ActivityDetails;
