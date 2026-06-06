import { OutlinedInput, OutlinedInputProps } from "@mui/material";

interface OutlineInputProps extends Omit<OutlinedInputProps, "endAdornment"> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}
export function OutlineInput(props: OutlineInputProps) {
  const { sx, endAdornment, startAdornment, ...otherProps } = props;
  return (
    <OutlinedInput
      {...otherProps}
      startAdornment={startAdornment || <span className="text-[var(--primary)]">$</span>}
      endAdornment={endAdornment}
      sx={{
        backgroundColor: "var(--color-surface)",
        color: "var(--primary)",
        height: "28px",
        fontWeight: 700,
        fontSize: "12px",
        lineHeight: "16px",
        letterSpacing: "0.4px",
        borderRadius: "8px",
        paddingY: "15px",
        ...(endAdornment && {
          paddingRight: "6px",
        }),
        "& fieldset": {
          borderColor: "var(--outline-variant)",
        },
        "&:hover fieldset": {
          borderColor: "var(--outline-variant)",
        },
        "&.Mui-focused fieldset": {
          borderColor: "var(--outline-variant)",
        },
        ...sx,
      }}
    />
  );
}
