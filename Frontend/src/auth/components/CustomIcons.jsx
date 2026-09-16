import * as React from "react";
import { useTheme } from "../../context/use-theme";

export function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.7 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.7 8.6-8.8 0-.6-.1-1.1-.2-1.6H12Z" />
            <path fill="#34A853" d="M3 12c0 1.8.7 3.4 1.8 4.8l2.9-2.2c-.4-.7-.7-1.6-.7-2.6s.2-1.8.7-2.6L4.8 7.2C3.7 8.6 3 10.2 3 12Z" />
            <path fill="#FBBC05" d="M12 21c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.6-1.8.9-3.1.9-2.5 0-4.6-1.7-5.4-4l-3 2.3C5.2 18.9 8.3 21 12 21Z" />
            <path fill="#4285F4" d="M18 18.8c1.7-1.5 2.6-3.8 2.6-6.6 0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.3-1 2.4-2.1 3.2l2.7 2.1Z" />
        </svg>
    );
}

export function MicrosoftIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
            <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
            <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
            <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
        </svg>
    );
}

export function SitemarkIcon() {
    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/assets/logo-dark.svg" : "/assets/logo.svg";

    return (
        <img
            src={logoSrc}
            alt="Kriyanto"
            style={{
                display: "block",
                height: 36,
                width: "auto",
                maxWidth: 190,
                objectFit: "contain",
                marginBottom: 4,
            }}
        />
    );
}
