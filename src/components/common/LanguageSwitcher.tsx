import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import { SUPPORTED_LANGUAGES } from "../../locales";
import type { Language } from "../../types/locale.types";

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const initialFocusIndexRef = useRef(0);
  const menuId = useId();
  const selectedIndex = SUPPORTED_LANGUAGES.findIndex(
    ({ code }) => code === language,
  );
  const selectedLanguage = SUPPORTED_LANGUAGES[selectedIndex];

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() =>
      optionRefs.current[initialFocusIndexRef.current]?.focus(),
    );
    const handlePointerOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      )
        setIsOpen(false);
    };
    const handleFocusOutside = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      )
        setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerOutside);
    document.addEventListener("focusin", handleFocusOutside);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", handlePointerOutside);
      document.removeEventListener("focusin", handleFocusOutside);
    };
  }, [isOpen]);

  const openMenu = (focusIndex = selectedIndex) => {
    initialFocusIndexRef.current = focusIndex;
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const selectLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    closeMenu();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const focusedIndex = optionRefs.current.findIndex(
      (option) => option === document.activeElement,
    );
    let nextIndex: number | undefined;
    if (event.key === "ArrowDown")
      nextIndex = (focusedIndex + 1) % SUPPORTED_LANGUAGES.length;
    else if (event.key === "ArrowUp")
      nextIndex =
        (focusedIndex - 1 + SUPPORTED_LANGUAGES.length) %
        SUPPORTED_LANGUAGES.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = SUPPORTED_LANGUAGES.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    } else if (event.key === "Tab") {
      closeMenu();
    } else if (
      event.key.length === 1 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      const query = event.key.toLocaleLowerCase();
      const match = SUPPORTED_LANGUAGES.findIndex(
        ({ label, code }) =>
          label.toLocaleLowerCase().startsWith(query) || code.startsWith(query),
      );
      if (match >= 0) nextIndex = match;
    }
    if (nextIndex !== undefined) {
      event.preventDefault();
      optionRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <span className="sr-only" role="status" aria-live="polite">
        {t("settings.languageChanged")}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-solid border-white/25 bg-white/10 px-3 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
        aria-label={t("settings.languageSelection", {
          language: selectedLanguage.label,
        })}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(
              event.key === "ArrowUp"
                ? SUPPORTED_LANGUAGES.length - 1
                : selectedIndex,
            );
          } else if (event.key === "Escape" && isOpen) {
            event.preventDefault();
            closeMenu();
          }
        }}
      >
        <Languages size={17} aria-hidden="true" />
        <span lang={language}>{selectedLanguage.label}</span>
        <ChevronDown
          className={`transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
          size={14}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          id={menuId}
          className="absolute top-full right-0 z-50 mt-2 w-48 max-w-[calc(100vw-32px)] rounded-2xl border border-solid border-outline bg-panel p-1.5 text-content shadow-xl"
          role="menu"
          aria-label={t("settings.languageLabel")}
          onKeyDown={handleMenuKeyDown}
        >
          {SUPPORTED_LANGUAGES.map(({ code, label }, index) => (
            <button
              key={code}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={language === code}
              tabIndex={-1}
              className="flex min-h-11 w-full items-center justify-between gap-4 rounded-xl bg-transparent px-3 py-2.5 text-left text-sm text-content transition-colors hover:bg-(--color-selected) focus-visible:bg-(--color-selected) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring aria-checked:bg-(--color-selected) aria-checked:font-semibold aria-checked:text-title motion-reduce:transition-none"
              onClick={() => selectLanguage(code)}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="text-[10px] font-semibold tracking-wider text-muted"
                  aria-hidden="true"
                >
                  {code.toUpperCase()}
                </span>
                <span lang={code}>{label}</span>
              </span>
              {language === code && <Check size={17} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
