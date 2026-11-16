import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { BACK_TO_TOP_THRESHOLD } from "../../constants/navigation";
import { useLocale } from "../../hooks/useLocale";

const BackToTop = () => {
  const { t } = useLocale();
  const [isVisible, setIsVisible] = useState(
    () => window.scrollY >= BACK_TO_TOP_THRESHOLD,
  );

  useEffect(() => {
    const handleScroll = () =>
      setIsVisible(window.scrollY >= BACK_TO_TOP_THRESHOLD);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBackToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById("page-title")?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  };

  return (
    <button
      type="button"
      className={`fixed right-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-30 grid size-12 place-items-center rounded-full border border-solid border-white/20 bg-(--green) text-white shadow-lg transition-[opacity,transform,visibility] duration-200 hover:-translate-y-1 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring motion-reduce:transform-none motion-reduce:transition-none sm:right-6 ${isVisible ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"}`}
      aria-label={t("navigation.backToTop")}
      title={t("navigation.backToTop")}
      tabIndex={isVisible ? 0 : -1}
      onClick={handleBackToTop}
    >
      <ArrowUp size={21} strokeWidth={2} aria-hidden="true" />
    </button>
  );
};

export default BackToTop;
