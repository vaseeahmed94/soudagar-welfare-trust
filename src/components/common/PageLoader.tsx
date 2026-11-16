import { useLocale } from "../../hooks/useLocale";
import Spinner from "./Spinner";
import Logo from "./Logo";

const PageLoader = () => {
  const { t } = useLocale();
  return (
    <div
      className="page-loader grid min-h-svh place-items-center bg-[image:var(--background-loader)] px-6 py-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex max-w-[360px] flex-col items-center">
        <Logo linked={false} showAbbreviation={false} />
        <p className="mt-[18px] mb-8 text-xs tracking-[0.12em] text-muted">
          {t("brand.valuesCompact")}
        </p>
        <Spinner />
        <p className="mt-4 mb-0 text-sm text-muted">{t("loader.community")}</p>
      </div>
    </div>
  );
};

export default PageLoader;
