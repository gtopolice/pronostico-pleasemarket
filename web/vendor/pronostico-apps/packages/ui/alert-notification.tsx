"use client";

import React from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";

interface AlertNotificationProps {
  isOpen: boolean;
  message: string;
  description?: string;
  severity: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

export function AlertNotification({
  isOpen,
  message,
  description,
  severity,
  onClose,
}: AlertNotificationProps) {
  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: "100%",
          borderRadius: "12px",
          fontWeight: 500,
          fontFamily: "var(--font-roboto)",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          backgroundColor:
            severity === "success"
              ? "var(--primary-button-bg-active, var(--color-yes))"
              : severity === "error"
                ? "var(--error, #ba1a1a)"
                : undefined,
          color:
            severity === "success"
              ? "var(--text-on-success, #006c3f)"
              : severity === "error"
                ? "var(--on-error, #ffffff)"
                : undefined,
          "& .MuiAlert-icon": {
            color:
              severity === "success"
                ? "var(--text-on-success)"
                : "inherit",
          },
          "& .MuiAlert-action": {
            color:
              severity === "success"
                ? "var(--text-on-success)"
                : "inherit",
          },
          /* If description exists, message becomes title and description becomes content */
          "& .MuiAlert-message": {
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          },
        }}
      >
        {description ? (
          <>
            <AlertTitle sx={{ margin: 0, fontWeight: 700 }}>
              {message}
            </AlertTitle>
            {description}
          </>
        ) : (
          message
        )}
      </Alert>
    </Snackbar>
  );
}
