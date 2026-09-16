import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "../context/use-theme";
import { copy } from "../content";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const { themeToggleAriaLabel, themeLightLabel, themeDarkLabel } = copy.navbar;
  const isDarkTheme = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 glass focus-ring"
      aria-label={themeToggleAriaLabel}
      title={themeToggleAriaLabel}
    >
      {isDarkTheme ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
      <span className="text-xs font-medium">{isDarkTheme ? themeDarkLabel : themeLightLabel}</span>
    </button>
  );
}
