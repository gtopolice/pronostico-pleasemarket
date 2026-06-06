"use client";

import { TextField as MuiTextField, TextFieldProps } from "@mui/material";
import { useTheme } from "../providers/theme-provider";

type Props = TextFieldProps & {
    disableOpacity?: boolean;
};

export function TextField(props: Props) {
    const { sx, disableOpacity, ...otherProps } = props;

    return (
        <MuiTextField
            {...otherProps}
            sx={{
                minHeight: "56px",
                "& .MuiInputBase-root": {
                    height: "100%",
                    backgroundColor: "transparent",
                    color: "var(--on-surface) !important",
                    "& .MuiInputBase-input": {
                        color: "var(--on-surface) !important",
                        WebkitTextFillColor: "var(--on-surface) !important",
                    },
                    "& fieldset": {
                        borderColor: "var(--outline-variant) !important",
                    },
                    "&:hover fieldset": {
                        borderColor: "var(--on-surface) !important",
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: "var(--primary) !important",
                    },
                },
                "& .MuiInputLabel-root": {
                    color: "var(--on-surface-variant)",
                    "&.Mui-focused": {
                        color: "var(--primary)",
                    },
                    "&.Mui-disabled": {
                        color: "var(--on-surface-variant) !important",
                        opacity: disableOpacity ? "1 !important" : "0.38",
                    },
                },
                "& input:-webkit-autofill": {
                    transition: "background-color 50000s ease-in-out 0s",
                    WebkitTextFillColor: "inherit",
                },
                "& .MuiInputBase-root.Mui-disabled": {
                    opacity: disableOpacity ? "1 !important" : "0.5",
                    "& fieldset": {
                        borderColor: "var(--outline-variant) !important",
                        opacity: disableOpacity ? "1 !important" : "1", // Ensure border is visible
                    },
                    "& .MuiInputBase-input": {
                        color: "var(--on-surface) !important",
                        WebkitTextFillColor: "var(--on-surface) !important",
                        opacity: disableOpacity ? "1 !important" : "0.5",
                    },
                },
                ...sx,
            }}
        />
    );
}
