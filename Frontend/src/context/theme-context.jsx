import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./theme-context-store";

const STORAGE_KEY = "kriyanto-theme";
function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  const legacyTheme = window.localStorage.getItem("theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }
  if (legacyTheme === "dark" || legacyTheme === "light") {
    return legacyTheme;
  }

  return getSystemTheme();
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
