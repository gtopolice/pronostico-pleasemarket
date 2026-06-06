"use client";

import { SwitchProps, styled } from "@mui/material";
import { Switch } from "@mui/material";

export const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 52,
  height: 32,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&.Mui-checked": {
      transform: "translateX(20px)",
      color: "#fff",
      "& .MuiSwitch-thumb": {
        width: 28,
        height: 28,
        backgroundColor: "#fff",
      },
      "& + .MuiSwitch-track": {
        backgroundColor: "var(--primary)",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 17,
    height: 17,
    backgroundColor: "var(--outline)",
    transition: theme.transitions.create(["width", "height", "background-color"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 32 / 2,
    backgroundColor: "var(--surface-container-highest)",
    border: "2px solid var(--outline)",
    boxSizing: "border-box",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));
