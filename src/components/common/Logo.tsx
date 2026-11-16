import { useLocale } from "../../hooks/useLocale";
interface LogoProps {
  light?: boolean;
  linked?: boolean;
  showAbbreviation?: boolean;
}

const Logo = ({
  light = false,
  linked = true,
  showAbbreviation = true,
}: LogoProps) => {
  const { t } = useLocale();
  const Container = linked ? "a" : "div";
  return (
    <Container
      className={`brand ${light ? "brand-light" : ""}`}
      href={linked ? "#home" : undefined}
      aria-label={linked ? t("brand.homeLabel") : undefined}
    >
      <svg
        className="brand-mark"
        viewBox="0 0 90 94"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M45 4l3.3 7 7.7 1-5.5 5.4 1.3 7.6-6.8-3.6-6.8 3.6 1.3-7.6L34 12l7.7-1L45 4Z"
          fill="#D5AB3B"
        />
        <path
          d="M43 88C9 76 4 50 17 29 8 57 26 69 43 88ZM47 88c34-12 39-38 26-59 9 28-9 40-26 59Z"
          fill={light ? "#C4D88A" : "var(--color-logo-leaf)"}
        />
        <path
          d="M39 83C16 70 16 51 21 41c2 16 13 17 18 42ZM51 83c23-13 23-32 18-42-2 16-13 17-18 42Z"
          fill="#91AF44"
        />
        <circle cx="45" cy="36" r="7" fill="#D5AB3B" />
        <circle cx="27" cy="32" r="5" fill="#4B9249" />
        <circle cx="63" cy="32" r="5" fill="#4B9249" />
        <path
          d="M45 76c-1-21-18-23-15-33 6 1 10 7 15 11 5-4 9-10 15-11 3 10-14 12-15 33Z"
          fill={light ? "#F2E1A2" : "var(--color-logo-heart)"}
        />
      </svg>
      <span>
        {t("brand.firstLine")}
        <br />
        {t("brand.secondLine")}
        {showAbbreviation && <small>{t("brand.abbreviation")}</small>}
      </span>
    </Container>
  );
};

export default Logo;
