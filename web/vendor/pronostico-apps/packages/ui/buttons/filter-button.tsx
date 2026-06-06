import { Button, ButtonProps } from "@mui/material";

interface FilterButtonProps extends ButtonProps {
  label: string;
  isSelected?: boolean;
}
export function FilterButton({
  label,
  isSelected = false,
  ...props
}: FilterButtonProps) {
  const bg = isSelected ? "var(--surface)" : "transparent";

  const paddingX = 14;
  const paddingY = 5;

  return (
    <Button
      disableElevation
      variant={isSelected ? "contained" : "text"}
      size="small"
      sx={{
        padding: `${paddingY}px ${paddingX}px !important`,
        paddingTop: `${paddingY}px !important`,
        paddingBottom: `${paddingY}px !important`,
        paddingLeft: `${paddingX}px !important`,
        paddingRight: `${paddingX}px !important`,
        minWidth: "auto",
        lineHeight: "16px",
        letterSpacing: "0.5px",
        fontWeight: "500",
        fontSize: "11px",
        backgroundColor: bg,
        color: "var(--on-surface)",
        borderRadius: "8px",
        "&.MuiButton-sizeSmall": {
          padding: `${paddingY}px ${paddingX}px !important`,
          paddingTop: `${paddingY}px !important`,
          paddingBottom: `${paddingY}px !important`,
          paddingLeft: `${paddingX}px !important`,
          paddingRight: `${paddingX}px !important`,
          minWidth: "auto",
        },
        "&.MuiButton-contained": {
          backgroundColor: bg,
          padding: `${paddingY}px ${paddingX}px !important`,
          "&:hover": {
            backgroundColor: bg,
          },
        },
        "&.MuiButton-text": {
          padding: `${paddingY}px ${paddingX}px !important`,
        },
      }}
      {...props}
    >
      {label}
    </Button>
  );
}
