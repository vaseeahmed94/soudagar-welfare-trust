import { useLocale } from "../../hooks/useLocale";
import { HandHeart, Heart, Trophy, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MemberDirectory } from "../../types/membership.types";

interface CommunityStatsSectionProps {
  memberDirectory: MemberDirectory | null;
}

interface AnimatedStatValueProps {
  value: number;
  formatNumber: (value: number) => string;
}

const AnimatedStatValue = ({ value, formatNumber }: AnimatedStatValueProps) => {
  const valueRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = valueRef.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setDisplayValue(0);
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || value === 0) {
      setDisplayValue(value);
      return;
    }
    let animationFrame = 0;
    const startedAt = performance.now();
    const duration = 900;
    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easedProgress));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, value]);

  return <strong ref={valueRef}>{formatNumber(displayValue)}</strong>;
};

const CommunityStatsSection = ({
  memberDirectory,
}: CommunityStatsSectionProps) => {
  const { t, formatNumber } = useLocale();
  const statistics = [
    {
      value: memberDirectory?.totalCount ?? 0,
      labelKey: "members.label",
      icon: Users,
    },
    { value: 1, labelKey: "stats.activities", icon: Heart },
    { value: 1, labelKey: "stats.supported", icon: HandHeart },
    { value: 1, labelKey: "stats.achievements", icon: Trophy },
  ] as const;
  return (
    <section className="stats" aria-label={t("stats.label")}>
      {statistics.map(({ value, labelKey, icon: Icon }) => (
        <div className="stat" key={labelKey}>
          <Icon aria-hidden="true" />
          <div>
            <AnimatedStatValue value={value} formatNumber={formatNumber} />
            <span>{t(labelKey)}</span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default CommunityStatsSection;
