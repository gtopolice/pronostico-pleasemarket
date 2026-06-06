"use client";

import * as React from "react";
import {
  Button,
  TextField,
  Dialog,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (toAddress: string, amountInUSDC: string) => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: string | null;
  txHash?: string | null;
  labels?: {
    close?: string;
    cancel?: string;
    withdraw?: string;
    deposit?: string;
    enterAmount?: string;
    address?: string;
  };
}

// Default labels in Spanish
const defaultLabels = {
  close: "Cerrar",
  cancel: "Cancelar",
  withdraw: "Retirar",
  deposit: "Depositar",
  enterAmount: "Ingresa una cantidad",
  address: "Dirección",
};

// Helper to get label with fallback
const getLabel = (labels: WithdrawModalProps["labels"], key: keyof typeof defaultLabels): string => {
  return labels?.[key] || defaultLabels[key];
};

export function WithdrawModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  isSuccess = false,
  error = null,
  txHash = null,
  labels,
}: WithdrawModalProps) {
  const [toAddress, setToAddress] = React.useState("");
  const [amountInUSDC, setAmountInUSDC] = React.useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Reset form when modal closes or transaction completes
  React.useEffect(() => {
    if (!open || isSuccess) {
      setToAddress("");
      setAmountInUSDC("");
    }
  }, [open, isSuccess]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    onSubmit(toAddress, amountInUSDC);
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    setToAddress("");
    setAmountInUSDC("");
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
      {/* Close button */}

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
        {isSuccess ? "Transacción exitosa" : error ? "Error" : "Retiro"}
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
            className="withdraw-modal-spinner"
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
            Enviando transacción...
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
            Transacción completada exitosamente
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
              {getLabel(labels, "close")}
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
            Error al procesar la transacción
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
              {getLabel(labels, "close")}
            </Button>
          </div>
        </div>
      )}

      {/* Form State (Initial) */}
      {!isLoading && !isSuccess && !error && (
        <>
          {/* Description */}
          <p
            style={{
              margin: "0 0 24px 0",
              fontSize: "14px",
              lineHeight: "20px",
              color: "var(--on-surface-variant)",
            }}
          >
            Por favor, ingresa la dirección de destino (0x...) y la cantidad de
            USDC a enviar.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} id="withdraw-form">
            <div style={{ marginBottom: "20px" }}>
              <TextField
                autoFocus
                required
                fullWidth
                id="toAddress"
                name="toAddress"
                label="Dirección de destino"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "var(--surface-container)",
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "var(--outline-variant)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--outline)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "var(--on-surface-variant)",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--primary)",
                  },
                  "& .MuiInputBase-input": {
                    color: "var(--on-surface)",
                  },
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <TextField
                required
                fullWidth
                id="amountInUSDC"
                name="amountInUSDC"
                label="Cantidad en USDC"
                type="text"
                value={amountInUSDC}
                onChange={(e) => setAmountInUSDC(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "var(--surface-container)",
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "var(--outline-variant)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--outline)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "var(--on-surface-variant)",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--primary)",
                  },
                  "& .MuiInputBase-input": {
                    color: "var(--on-surface)",
                  },
                }}
              />
            </div>

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
                {getLabel(labels, "cancel")}
              </Button>
              <Button
                type="submit"
                form="withdraw-form"
                variant="contained"
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
                {getLabel(labels, "close")}
              </Button>
            </div>
          </form>
        </>
      )}
    </Dialog>
  );
}
