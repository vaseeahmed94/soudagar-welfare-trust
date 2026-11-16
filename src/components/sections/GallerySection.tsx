import { useLocale } from "../../hooks/useLocale";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";
import { GALLERY } from "../../constants/gallery";
import type { Dispatch, SetStateAction } from "react";
import type { ModalState } from "../../types/modal.types";

interface GallerySectionProps {
  onModalChange: Dispatch<SetStateAction<ModalState>>;
}

const GallerySection = ({ onModalChange }: GallerySectionProps) => {
  const { t } = useLocale();
  return (
    <section className="gallery" id="gallery">
      <div className="small-heading">
        <h2>
          <span>{t("gallery.heading")}</span>
        </h2>
        <p>{t("gallery.description")}</p>
      </div>
      <div className="gallery-grid mb-3 grid grid-cols-3 gap-3.5">
        {GALLERY.map((photo, index) => (
          <button
            key={photo.titleKey}
            onClick={() => onModalChange({ kind: "gallery", index })}
            aria-label={`View image: ${t(photo.titleKey)}`}
          >
            <img
              src={getImageUrl(photo.image)}
              alt={t(photo.titleKey)}
              loading="lazy"
            />
            <span>{t(photo.titleKey)}</span>
          </button>
        ))}
      </div>
      <button
        className="button button-green button-small"
        onClick={() => onModalChange({ kind: "gallery", index: 0 })}
      >
        {t("gallery.viewAll")} <ArrowRight size={15} />
      </button>
    </section>
  );
};

export default GallerySection;
