import { useLocale } from "../../hooks/useLocale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { ModalState } from "../../types/modal.types";
import { getImageUrl } from "../../utils/getImageUrl";
import { GALLERY } from "../../constants/gallery";

interface GalleryLightboxProps {
  index: number;
  onModalChange: Dispatch<SetStateAction<ModalState>>;
}

const GalleryLightbox = ({ index, onModalChange }: GalleryLightboxProps) => {
  const { t } = useLocale();
  return (
    <>
      <img
        className="lightbox-image"
        src={getImageUrl(GALLERY[index].image)}
        alt={t(GALLERY[index].titleKey)}
      />
      <div className="lightbox-caption">
        <div>
          <h2 id="modal-title">{t(GALLERY[index].titleKey)}</h2>
          <p>{t(GALLERY[index].captionKey)}</p>
        </div>
        <div className="lightbox-controls">
          <button
            className="round-button"
            aria-label={t("gallery.previous")}
            onClick={() =>
              onModalChange({
                kind: "gallery",
                index: (index + GALLERY.length - 1) % GALLERY.length,
              })
            }
          >
            <ChevronLeft />
          </button>
          <span>
            {index + 1} / {GALLERY.length}
          </span>
          <button
            className="round-button"
            aria-label={t("gallery.next")}
            onClick={() =>
              onModalChange({
                kind: "gallery",
                index: (index + 1) % GALLERY.length,
              })
            }
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      <p className="form-note">{t("gallery.illustrationNote")}</p>
    </>
  );
};

export default GalleryLightbox;
