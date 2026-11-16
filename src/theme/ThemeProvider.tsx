import { useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { THEME_STORAGE_KEY } from "../constants/theme";
import type { ThemePreference } from "../types/theme.types";
import { ThemeContext } from "./themeContext";

const readThemePreference = (): ThemePreference => {
  try {
    const savedPreference = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedPreference === "light" || savedPreference === "dark")
      return savedPreference;
  } catch {
    // Keep theme switching available when browser storage is restricted.
  }
  return "light";
};

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themePreference, setThemePreference] =
    useState<ThemePreference>(readThemePreference);
  const theme = themePreference;

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#101b17" : "#0b4938");
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null)
        setThemePreference(readThemePreference());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updateThemePreference = (preference: ThemePreference) => {
    setThemePreference(preference);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // The selected theme still works for this visit.
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themePreference,
        setThemePreference: updateThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
