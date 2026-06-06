"use client";

import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

interface BadgeAvatarsProps {
  avatar?: string;
  showBadge?: boolean;
  loading?: boolean;
}

export const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#FF3333",
    color: "#FF3333",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: "\"\"",
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

export default function BadgeAvatars({
  avatar,
  showBadge = true,
  loading = false,
}: BadgeAvatarsProps) {
  const avatarElement = loading ? (
    <Skeleton
      variant="circular"
      width={28}
      height={28}
      sx={{ backgroundColor: "var(--surface-container-high)" }}
    />
  ) : (
    <Avatar
      alt="User avatar"
      src={avatar || undefined}
      sx={{
        width: 28,
        height: 28,
        backgroundColor: "transparent",
        "& img": { objectFit: "cover" },
      }}
    >
      {!avatar && <PersonOutlineIcon sx={{ fontSize: 20, color: "var(--auth-button-text)", }} />}
    </Avatar>
  );

  return (
    <Stack direction="row" spacing={2}>
      {showBadge ? (
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
        >
          {avatarElement}
        </StyledBadge>
      ) : (
        avatarElement
      )}
    </Stack>
  );
}
