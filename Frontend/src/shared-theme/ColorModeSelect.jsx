import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { BsMoon, BsSun } from "react-icons/bs";
import { useTheme } from "../context/use-theme";

export default function ColorModeSelect({ sx }) {
    const { theme, toggleTheme } = useTheme();
    const isDarkTheme = theme === "dark";

    return (
        <Tooltip title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton onClick={toggleTheme} sx={sx} color="inherit" aria-label="Toggle color mode">
                {isDarkTheme ? <BsSun /> : <BsMoon />}
            </IconButton>
        </Tooltip>
    );
}
