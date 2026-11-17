import { useLocale } from "../../hooks/useLocale";
import { getImageUrl } from "../../utils/getImageUrl";
import communityImpactVideo from "../../assets/media/community-impact.mp4";

const ImpactVideoSection = () => {
  const { t } = useLocale();

  return (
    <section className="impact-video" aria-labelledby="impact-video-heading">
      <div className="impact-video-copy">
        <span className="eyebrow">{t("video.eyebrow")}</span>
        <h2 id="impact-video-heading">{t("video.heading")}</h2>
        <p>{t("video.description")}</p>
        <div className="impact-video-values" aria-label={t("brand.values")}>
          <span>{t("brand.humanity")}</span>
          <span>{t("brand.service")}</span>
          <span>{t("brand.unity")}</span>
        </div>
        <span className="impact-video-note">{t("video.note")}</span>
      </div>
      <div className="impact-video-frame">
        <video
          controls
          playsInline
          preload="metadata"
          poster={getImageUrl("community")}
          aria-label={t("video.label")}
        >
          <source src={communityImpactVideo} type="video/mp4" />
          {t("video.unsupported")}
        </video>
      </div>
    </section>
  );
};

export default ImpactVideoSection;
