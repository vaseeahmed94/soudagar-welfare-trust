import { useLocale } from "../../hooks/useLocale";
import { HandHeart, Heart, Trophy, Users } from "lucide-react";
import type { MemberDirectory } from "../../types/membership.types";

interface CommunityStatsSectionProps {
  memberDirectory: MemberDirectory | null;
}

const CommunityStatsSection = ({
  memberDirectory,
}: CommunityStatsSectionProps) => {
  const { t, formatNumber } = useLocale();
  const statistics = [
    {
      value: memberDirectory ? formatNumber(memberDirectory.totalCount) : "—",
      labelKey: "members.label",
      icon: Users,
    },
    { value: "50+", labelKey: "stats.activities", icon: Heart },
    { value: "100+", labelKey: "stats.supported", icon: HandHeart },
    { value: "10+", labelKey: "stats.achievements", icon: Trophy },
  ] as const;
  return (
    <section className="stats" aria-label={t("stats.label")}>
      {statistics.map(({ value, labelKey, icon: Icon }) => (
        <div className="stat" key={labelKey}>
          <Icon aria-hidden="true" />
          <div>
            <strong>{value}</strong>
            <span>{t(labelKey)}</span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default CommunityStatsSection;
