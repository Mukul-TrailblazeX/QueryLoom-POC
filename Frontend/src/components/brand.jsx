import { useTheme } from "../context/use-theme";

export default function Brand({ compact = false }) {
    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/assets/logo-dark.svg" : "/assets/logo.svg";

    return (
        <span className="inline-flex items-center">
            <img
                src={logoSrc}
                alt=""
                aria-hidden="true"
                className={compact ? "brand-logo h-9 w-9 object-cover object-left" : "brand-logo h-9 w-auto max-w-[150px] lg:max-w-[190px]"}
            />
        </span>
    );
}
