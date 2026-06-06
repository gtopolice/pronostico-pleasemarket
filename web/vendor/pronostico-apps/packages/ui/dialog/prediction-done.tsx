"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Image from "next/image";
import { truncateHash } from "../../prediction-market/utils/string";
import { BottomSheet } from "../bottom-sheet/bottom-sheet";

interface PredictionDoneDialogProps {
  open: boolean;
  onClose: () => void;
  hash?: string;
  title?: string;
  description?: string;
  closeText?: string;
}

export function PredictionDoneDialog({
  open,
  onClose,
  hash,
  title,
  description,
  closeText,
}: PredictionDoneDialogProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      aria-describedby="prediction-done-dialog-description"
    >
      <DialogContent className="gap-5 flex flex-col items-center">
        <div className="rounded-full flex items-center justify-center">
          <Image src="/confetti.png" alt="Confetti" width={86} height={86} />
        </div>

        <DialogContentText
          id="prediction-done-dialog-description"
          sx={{
            color: "var(--primary)",
            fontSize: "24px",
            fontWeight: 700,
            lineHeight: "32px",
            letterSpacing: "0px",
            textAlign: "center",
          }}
        >
          {title || "Pronóstico realizado"}
        </DialogContentText>
        <div className="flex flex-col items-center">
          <DialogContentText
            id="prediction-done-dialog-description"
            sx={{
              color: "var(--primary)",
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "16px",
              letterSpacing: "0.4px",
              textAlign: "center",
              mb: 0,
            }}
          >
            {description || "Se completó exitosamente tu pronóstico."}
          </DialogContentText>
          {hash && (
            <span className="text-[12px] text-[var(--surface-tint)] leading-[16px] tracking-[0.4px] font-400">
              Hash: {truncateHash(hash, 10, 10)}
            </span>
          )}
        </div>

        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          sx={{
            borderRadius: "100px",
            backgroundColor: "var(--primary)",
            color: "var(--on-primary)",
            px: 4,
            textTransform: "none",
            width: "100%",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "var(--primary)",
            },
          }}
        >
          {closeText || "Cerrar"}
        </Button>
      </DialogContent>
    </BottomSheet>
  );
}
