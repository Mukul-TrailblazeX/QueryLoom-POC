import * as React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useTheme as useSiteTheme } from "../context/use-theme";

function createAppTheme(mode) {
    const theme = createTheme({
        palette: {
            mode,
            primary: {
                main: "#3a7d44",
            },
            background: mode === "dark"
                ? { default: "#0f0f0f", paper: "#171717" }
                : { default: "#f0ede8", paper: "#ffffff" },
        },
        shape: {
            borderRadius: 12,
        },
        typography: {
            fontFamily: "Poppins, sans-serif",
        },
    });

    theme.applyStyles = (targetMode, styles) => (mode === targetMode ? styles : {});
    return theme;
}

export default function AppTheme({ children }) {
    const { theme: siteTheme } = useSiteTheme();
    const muiTheme = React.useMemo(() => createAppTheme(siteTheme), [siteTheme]);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline enableColorScheme />
            {children}
        </ThemeProvider>
    );
}
