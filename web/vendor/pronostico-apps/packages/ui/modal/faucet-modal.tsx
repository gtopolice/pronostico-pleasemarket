"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Button as UIButton } from "@pronostico-apps/ui";

export interface FaucetModalProps {
  userAddress: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (toAddress: string, amountInUSDC: string) => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: string | null;
  txHash?: string | null;
  canRequest?: boolean;
  timeUntilNext?: number;
  faucetBalance?: string;
  labels?: {
    close?: string;
    cancel?: string;
    claim?: string;
    claim100USD?: string;
    notAvailable?: string;
    transactionSuccess?: string;
    description?: string;
    sendingTransaction?: string;
    nextClaim?: string;
  };
}

// Default labels in Spanish
const faucetDefaultLabels = {
  close: "Cerrar",
  cancel: "Cancelar",
  claim: "Reclamar",
  claim100USD: "Reclamar 100 USD",
  notAvailable: "No disponible",
  transactionSuccess: "Transacción exitosa",
  sendingTransaction: "Enviando transacción...",
  description: "Solo podrás reclamar USDC cada 24 horas.",
  nextClaim: "Siguiente reclamo en:",
};

const faucetGetLabel = (labels: FaucetModalProps["labels"], key: keyof typeof faucetDefaultLabels): string => {
  return labels?.[key] || faucetDefaultLabels[key];
};

//TODO: remove this component to dialog file
export function FaucetModal({
  userAddress,
  open,
  onClose,
  onSubmit,
  isLoading = false,
  isSuccess = false,
  error = null,
  txHash = null,
  canRequest = true,
  timeUntilNext = 0,
  faucetBalance = "0",
  labels,
}: FaucetModalProps) {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !userAddress) return; // Prevent multiple submissions and invalid addresses
    onSubmit(userAddress, "100");
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? "24px 24px 0 0" : "24px",
          padding: "24px",
          position: isMobile ? "fixed" : "relative",
          bottom: isMobile ? 0 : "auto",
          margin: isMobile ? 0 : "32px",
          width: "100%",
          maxWidth: "440px",
          overflow: "hidden",
          backgroundImage: "none",
          backgroundColor: "var(--surface-container-low)",
          boxShadow: isMobile ? "none" : "0px 8px 36px rgba(55,65,81,0.15)",
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: isMobile ? "flex-end" : "center",
        },
      }}
    >
      {/* Title */}
      <h2
        style={{
          margin: "0 0 16px 0",
          fontSize: "24px",
          fontWeight: 600,
          lineHeight: "32px",
          color: "var(--on-surface)",
          paddingRight: "40px",
        }}
      >
        {isSuccess ? faucetGetLabel(labels, "transactionSuccess") : error ? "Error" : faucetGetLabel(labels, "claim")}
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--outline-variant)",
              borderTop: "4px solid var(--primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px",
            }}
            className="faucet-modal-spinner"
          />
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: "20px",
              color: "var(--on-surface-variant)",
              textAlign: "center",
            }}
          >
            {faucetGetLabel(labels, "sendingTransaction")}...
          </p>
        </div>
      )}

      {/* Success State */}
      {isSuccess && !isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "var(--secondary-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--on-secondary-container)"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "24px",
              color: "var(--on-surface)",
              textAlign: "center",
            }}
          >
            {faucetGetLabel(labels, "transactionSuccess")}
          </p>
          {txHash && (
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: "16px",
                color: "var(--on-surface-variant)",
                textAlign: "center",
                wordBreak: "break-all",
              }}
            >
              Hash: {txHash.substring(0, 10)}...
              {txHash.substring(txHash.length - 8)}
            </p>
          )}
          <div style={{ marginTop: "24px", width: "100%" }}>
            <Button
              onClick={handleClose}
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)",
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 500,
                padding: "10px 20px",
                borderRadius: "100px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "var(--primary-container)",
                  boxShadow: "none",
                },
              }}
            >
              {faucetGetLabel(labels, "close")}
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && !isSuccess && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "var(--error-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <CloseIcon
              sx={{ color: "var(--on-error-container)", fontSize: 32 }}
            />
          </div>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "24px",
              color: "var(--on-surface)",
              textAlign: "center",
            }}
          >
            Error
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: "20px",
              color: "var(--error)",
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            {error}
          </p>
          <div style={{ marginTop: "24px", width: "100%" }}>
            <Button
              onClick={handleClose}
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)",
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 500,
                padding: "10px 20px",
                borderRadius: "100px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "var(--primary-container)",
                  boxShadow: "none",
                },
              }}
            >
              {faucetGetLabel(labels, "close")}
            </Button>
          </div>
        </div>
      )}

      {/* Form State (Initial) */}
      {!isLoading && !isSuccess && !error && (
        <>
          {/* Description */}
          <div style={{ marginBottom: "24px" }}>
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                lineHeight: "20px",
                color: "var(--on-surface-variant)",
              }}
            >
              {faucetGetLabel(labels, "description")}
            </p>

            {!canRequest && timeUntilNext > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  padding: "12px",
                  backgroundColor: "var(--surface-container-low)",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--on-surface-variant)" }}>
                    {faucetGetLabel(labels, "nextClaim")}
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--error)" }}>
                    {Math.floor(timeUntilNext / 3600)}h{" "}
                    {Math.floor((timeUntilNext % 3600) / 60)}m
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} id="faucet-form">
            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={handleClose}
                sx={{
                  color: "var(--on-surface)",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "10px 20px",
                  borderRadius: "100px",
                  "&:hover": {
                    backgroundColor: "var(--surface-container)",
                  },
                }}
              >
                {faucetGetLabel(labels, "cancel")}
              </Button>
              <UIButton

                type="submit"
                form="faucet-form"
                variant="modal"
                disabled={!canRequest}
                className="rounded-full"
                // sx={{
                //   backgroundColor: "var(--primary)",
                //   color: "var(--on-primary)",
                //   textTransform: "none",
                //   fontSize: "14px",
                //   fontWeight: 500,
                //   padding: "10px 20px",
                //   borderRadius: "100px",
                //   boxShadow: "none",
                //   "&:hover": {
                //     backgroundColor: "var(--primary-container)",
                //     boxShadow: "none",
                //   },
                //   "&.Mui-disabled": {
                //     backgroundColor: "var(--outline-variant)",
                //     color: "var(--on-surface-variant)",
                //     opacity: 0.6,
                //   },
                // }}
                label={canRequest ? faucetGetLabel(labels, "claim100USD") : faucetGetLabel(labels, "notAvailable")}
              >
              </UIButton>
            </div>
          </form>
        </>
      )}
    </Dialog>
  );
}
