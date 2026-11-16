import { Moon, Sun } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import { useTheme } from "../../hooks/useTheme";

const ThemeSwitcher = () => {
  const { t } = useLocale();
  const { themePreference, setThemePreference } = useTheme();

  return (
    <div
      className="relative isolate inline-flex shrink-0 items-center gap-1 rounded-full border border-solid border-outline bg-panel p-1 shadow-sm"
      role="group"
      aria-label={t("settings.themeLabel")}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1 left-1 size-10 rounded-full bg-(--green) shadow-sm transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${themePreference === "dark" ? "translate-x-11" : "translate-x-0"}`}
      />
      <button
        type="button"
        className="relative z-10 grid size-10 place-items-center rounded-full bg-transparent text-muted transition-colors duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-pressed:text-white motion-reduce:transition-none"
        aria-label={t("settings.light")}
        title={t("settings.light")}
        aria-pressed={themePreference === "light"}
        onClick={() => setThemePreference("light")}
      >
        <Sun size={19} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="relative z-10 grid size-10 place-items-center rounded-full bg-transparent text-muted transition-colors duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-pressed:text-white motion-reduce:transition-none"
        aria-label={t("settings.dark")}
        title={t("settings.dark")}
        aria-pressed={themePreference === "dark"}
        onClick={() => setThemePreference("dark")}
      >
        <Moon size={19} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
