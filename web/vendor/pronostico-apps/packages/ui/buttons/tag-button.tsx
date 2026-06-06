import { Button } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { Skeleton } from "@mui/material";
export interface TagButtonProps {
  label: string;
  isSelected: boolean;
  id: string;
  onClick?: (tagId: string) => void;
  isLoading?: boolean;
}
export function TagButton({
  label,
  isSelected,
  onClick,
  id,
  isLoading = false,
}: TagButtonProps) {
  const bgColor = isSelected ? "var(--secondary-container)" : "transparent";
  const textColor = isSelected
    ? "var(--primary-container)"
    : "var(--on-surface-variant)";

  if (isLoading) {
    return (
      <Skeleton
        variant="rounded"
        width={60}
        height={32}
        style={{ borderRadius: "10px" }}
      />
    );
  }

  return (
    <Button
      variant="outlined"
      startIcon={
        isSelected ? <CheckIcon sx={{ width: 16, height: 16 }} /> : null
      }
      onClick={() => onClick?.(id)}
      sx={{
        height: "32px",
        boxShadow: "none",
        textTransform: "none",
        borderColor: isSelected
          ? "transparent"
          : "var(--tag-button-border-special)",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        lineHeight: "20px",
        backgroundColor: bgColor,
        letterSpacing: "0.1px",
        color: textColor,
        "& .MuiButton-label": {
          textTransform: "none",
        },
        "& .MuiButton-text": {
          textTransform: "none",
        },
        "&:hover": {
          boxShadow: "none",
          textTransform: "none",
        },
      }}
      style={{ textTransform: "none" }}
    >
      {label}
    </Button>
  );
}
