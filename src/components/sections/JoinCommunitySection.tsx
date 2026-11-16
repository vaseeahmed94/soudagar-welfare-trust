import { useLocale } from "../../hooks/useLocale";
import { ArrowRight, HeartHandshake, Users } from "lucide-react";

interface JoinCommunitySectionProps {
  onJoin: () => void;
}

const JoinCommunitySection = ({ onJoin }: JoinCommunitySectionProps) => {
  const { t } = useLocale();
  return (
    <section className="join-strip">
      <div className="join-inner container">
        <HeartHandshake className="join-symbol" />
        <div>
          <h2>{t("join.heading")}</h2>
          <p>{t("join.description")}</p>
        </div>
        <button className="button button-gold" onClick={onJoin}>
          <Users size={18} /> {t("common.becomeMember")}{" "}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default JoinCommunitySection;
