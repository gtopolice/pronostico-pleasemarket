"use client";

import { TextField, TextFieldProps } from "@mui/material";
import { useId } from "react";

export function Input(props: TextFieldProps) {
  const generatedId = useId();
  const id = props.id || generatedId;

  return (
    <TextField
      {...props}
      id={id}
      suppressHydrationWarning
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text-primary)",
          "& fieldset": {
            borderColor: "var(--color-text-secondary)",
          },
          "&:hover fieldset": {
            borderColor: "var(--color-primary)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--color-primary)",
          },
        },
        "& .MuiInputLabel-root": {
          color: "var(--color-text-secondary)",
          "&.Mui-focused": {
            color: "var(--color-primary)",
          },
        },
        ...props.sx,
      }}
    />
  );
}
