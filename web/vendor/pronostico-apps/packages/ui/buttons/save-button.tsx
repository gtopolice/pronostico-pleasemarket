import { IconButton } from "@mui/material";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import React from "react";

export interface SaveButtonProps {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  isActivated?: boolean;
  size?: number | string;
  icon?: React.ReactNode;
  iconSize?: number | string;
  activeBg?: string;
  inactiveBg?: string;
  activeColor?: string;
  inactiveColor?: string;
  onlyIcon?: boolean;
  showFilledIconWhenActivated?: boolean;
}

export function SaveButton({
  onClick,
  isActivated,
  size,
  icon,
  iconSize,
  activeBg = "var(--save-button-bg)",
  inactiveBg = "#4C45461A",
  activeColor = "var(--on-tertiary-container)",
  inactiveColor = "var(--on-surface-variant)",
  onlyIcon = false,
  showFilledIconWhenActivated = false,
}: SaveButtonProps) {
  const bg = isActivated ? activeBg : inactiveBg;
  const iconColor = isActivated ? activeColor : inactiveColor;

  const content = icon ? (
    icon
  ) : (
    showFilledIconWhenActivated && isActivated ? <BookmarkIcon
      sx={{
        color: iconColor,
        fontSize: iconSize || 20,
        fontWeight: 900,
      }}
    /> : <TurnedInNotIcon
      sx={{
        color: iconColor,
        fontSize: iconSize || 20,
        fontWeight: 900,
      }}
    />
  );

  if (onlyIcon) {
    return (
      <div
        role="button"
        aria-label="save-icon"
        onClick={(e: any) => onClick?.(e)}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <IconButton
      sx={{
        backgroundColor: bg,
        width: size,
        height: size,
        "&:hover": {
          backgroundColor: bg,
          opacity: 0.9,
        },
        padding: size ? 0 : undefined,
        minWidth: size ? size : undefined,
      }}
      aria-label="save-button"
      onClick={onClick}
    >
      {content}
    </IconButton>
  );
}
