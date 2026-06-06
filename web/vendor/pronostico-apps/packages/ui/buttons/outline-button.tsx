import { Button, ButtonProps as MuiButtonProps } from "@mui/material";

export function OutlineButton({
  children,
  startIcon,
  sx,
  ...otherProps
}: MuiButtonProps) {
  return (
    <Button
      startIcon={startIcon}
      variant="outlined"
      sx={{
        backgroundColor: "transparent",
        color: "var(--on-surface-variant)",
        border: "1px solid var(--outline)",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        height: "32px",
        lineHeight: "20px",
        letterSpacing: "0.1px",
        textTransform: "none",
        "& .MuiButton-startIcon": {
          display: "flex",
          alignItems: "center",
          marginRight: "8px",
        },
        "&.Mui-disabled": {
          color: "var(--on-surface)",
          opacity: 0.38,
          borderColor: "var(--outline)",
        },
        ...sx,
      }}
      {...otherProps}
    >
      {children}
    </Button>
  );
}
