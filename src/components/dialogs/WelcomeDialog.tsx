import { useLocale } from "../../hooks/useLocale";
import { getImageUrl } from "../../utils/getImageUrl";
import communityImpactVideo from "../../assets/media/community-impact.mp4";
import { useEffect, useRef, useState } from "react";

const WelcomeDialog = () => {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAutoplay(!reducedMotion.matches);
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      setShouldAutoplay(!event.matches);
    };
    reducedMotion.addEventListener("change", handlePreferenceChange);
    return () =>
      reducedMotion.removeEventListener("change", handlePreferenceChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldAutoplay) return;
    video.play().catch(() => {
      // Browser autoplay policies may require the visitor to press play.
    });
    return () => video.pause();
  }, [shouldAutoplay]);

  return (
    <div className="welcome-dialog-content">
      <span className="eyebrow">{t("welcome.eyebrow")}</span>
      <h2 id="modal-title">{t("welcome.heading")}</h2>
      <p>{t("welcome.description")}</p>
      <div className="welcome-video-frame">
        <video
          ref={videoRef}
          autoPlay={shouldAutoplay}
          controls
          muted
          playsInline
          preload="auto"
          poster={getImageUrl("community")}
          aria-label={t("welcome.videoLabel")}
        >
          <source src={communityImpactVideo} type="video/mp4" />
          {t("video.unsupported")}
        </video>
      </div>
    </div>
  );
};

export default WelcomeDialog;
