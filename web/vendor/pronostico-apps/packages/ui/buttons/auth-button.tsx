"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Button as MuiButton,
  CircularProgress,
  Menu,
  MenuItem,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { PrivyInterface } from "@privy-io/react-auth";
import { Close } from "@mui/icons-material";
import BadgeAvatars from "../avatar";

interface MenuItemProps {
  label: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
  sx?: object;
  isActive?: boolean;
  switchToExtraView?: boolean;
}
export interface AuthButtonProps {
  label: string;
  privyClient: PrivyInterface;
  menuItems?: MenuItemProps[];
  avatar?: string;
  loading?: boolean;
  extraView?: React.ReactNode;
  extraViewTitle?: string;
  extraViewIcon?: React.ReactNode;
  showBadge?: boolean;
}

export function AuthButton({
  label,
  privyClient,
  menuItems,
  avatar,
  loading = false,
  extraView,
  extraViewTitle,
  extraViewIcon,
  showBadge = false,
}: AuthButtonProps) {
  const authenticated = privyClient?.authenticated;
  const ready = privyClient?.ready;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentView, setCurrentView] = useState<"main" | "extra">("main");
  const open = Boolean(anchorEl);

  const login = () => {
    privyClient?.login?.();
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (authenticated) {
      setAnchorEl(event.currentTarget);
    } else {
      login();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setTimeout(() => setCurrentView("main"), 200); // Reset after animation
  };

  // if not ready, show a loading spinner
  if (!ready) {
    return (
      <div className="flex items-center justify-center mr-7 ml-6 flex-1">
        <CircularProgress size={25} />
      </div>
    );
  }

  if (authenticated) {
    return (
      <>
        <Button
          startIcon={
            <BadgeAvatars
              showBadge={showBadge}
              avatar={avatar}
              loading={loading}
            />
          }
          endIcon={
            <KeyboardArrowDownIcon
              sx={{
                width: 22,
                height: 22,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease-in-out",
              }}
            />
          }
          onClick={handleClick}
          sx={{
            boxShadow: "none",
            textTransform: "none",
            paddingLeft: "18px",
            paddingRight: "10px",
            color: "var(--auth-button-text)",
            backgroundColor: "var(--secondary-container)",
            borderRadius: "100px",
            gap: "3px",
            "& .MuiButton-startIcon": { marginRight: "1px" },
            "& .MuiButton-endIcon": { marginLeft: "1px" },
            "&:hover": { boxShadow: "none" },
          }}
        />
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                marginTop: "10px",
                width: currentView === "extra" ? "372px" : "236px",
                minWidth: "180px",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                backgroundColor: "var(--surface-container-low)",
                "& .MuiMenuItem-root": {
                  padding: "0px",
                  fontSize: "14px",
                  "&:hover": { backgroundColor: "transparent" },
                },
              },
            },
            list: {
              sx: {
                padding: 0,
                display: "flex",
                flexDirection: "column",
              },
            },
          }}
        >
          <div style={{ overflow: "hidden", position: "relative" }}>
            <AnimatePresence mode="wait">
              {currentView === "main" ? (
                <motion.div
                  key="main"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {menuItems?.map((item, index) => (
                    <MenuItem
                      key={`${item.label}-${index}`}
                      onClick={() => {
                        if (item.switchToExtraView) {
                          setCurrentView("extra");
                        } else {
                          item.onClick?.();
                          handleClose();
                        }
                      }}
                      sx={[
                        {
                          padding: "0px",
                          backgroundColor: item.isActive
                            ? "var(--surface-container-highest) !important"
                            : "transparent",
                          "&:hover": {
                            backgroundColor: item.isActive
                              ? "var(--surface-container-highest) !important"
                              : "var(--surface-container-high) !important",
                          },
                        },
                        ...(item.sx ? [item.sx] : []),
                      ]}
                    >
                      <motion.div
                        className="flex items-center w-full px-4 py-[12px]"
                        style={{
                          justifyContent: "start",
                          gap: item?.endIcon ? "10px" : "18px",
                        }}
                        whileHover={!item.isActive ? { x: 6 } : {}}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <div className="flex items-center justify-center w-6 h-6">
                          {item.startIcon}
                        </div>
                        <span
                          className={`text-[16px] font-[400] leading-[24px] letter-spacing-[0.5px] ${index === menuItems!.length - 1
                            ? "text-[var(--error)]"
                            : "text-[var(--on-surface)]"
                            } ${item.isActive ? "font-[700]" : ""}`}
                        >
                          {item.label}
                        </span>
                        {item.endIcon && item.endIcon}
                      </motion.div>
                    </MenuItem>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="extra"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex flex-col w-full"
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--outline-variant)] h-[60px]">
                    <div className="flex items-center gap-3">
                      {extraViewIcon}
                      <span className="text-[14px] font-[700] text-[var(--on-surface)] leading-[16px] letter-spacing-[0.5px]">
                        {extraViewTitle || "Volver"}
                      </span>
                    </div>
                    <MuiButton
                      onClick={() => setCurrentView("main")}
                      sx={{
                        minWidth: "auto",
                        padding: "4px",
                        color: "var(--on-surface-variant)",
                        "&:hover": {
                          backgroundColor: "var(--surface-container-high)",
                        },
                      }}
                    >
                      <Close
                        sx={{
                          transform: "rotate(90deg)",
                          fontSize: 18,
                          color: "var(--on-surface-variant)",
                        }}
                      />
                    </MuiButton>
                  </div>
                  <div className="w-full">{extraView}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Menu>
      </>
    );
  }

  return (
    <Button
      startIcon={<PersonOutlineIcon sx={{ width: 17, height: 17, color: "var(--auth-button-text)", }} />}
      onClick={login}
      sx={{
        color: "var(--auth-button-text)",
        backgroundColor: "var(--secondary-container)",
        borderRadius: "100px",
        textTransform: "none",
      }}
    >
      {label}
    </Button>
  );
}

interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  children?: React.ReactNode;
}
const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <MuiButton
      variant="contained"
      disableElevation
      sx={{
        backgroundColor: "var(--secondary-container)",
        boxShadow: "none",
        textTransform: "none",
        display: "flex",
        alignItems: "center",
        "& .MuiButton-startIcon": {
          marginBottom: "2px",
          display: "flex",
          alignItems: "center",
        },
        "&:hover": {
          backgroundColor: "var(--secondary-container)",
          boxShadow: "none",
        },
        ...(props.sx || {}),
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
