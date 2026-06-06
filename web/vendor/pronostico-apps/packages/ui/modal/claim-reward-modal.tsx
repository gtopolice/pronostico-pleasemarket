"use client";

import * as React from "react";
import { Dialog, useMediaQuery, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ClaimByMarket } from "@pronostico-apps/interfaces";
import { formatNumber } from "@pronostico-apps/prediction-market";
import { Button } from "../buttons/button";
import { PronosticoIcon, ShareIcon } from "../assets/icons";

export interface ClaimRewardModalProps {
  open: boolean;
  onClose: () => void;
  claim: ClaimByMarket | null;
  onClaim?: (id: string) => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  labels?: {
    done?: string;
    processing?: string;
    claimProfit?: string;
    share?: string;
    shareTitle?: string;
    copiedToClipboard?: string;
    locale?: string;
    youWon?: string;
    excellentWork?: string;
    purchase?: string;
    won?: string;
    shareText?: string;
  };
}

//TODO: remove this component to dialog file
export function ClaimRewardModal({
  open,
  onClose,
  claim,
  onClaim,
  isLoading,
  isSuccess,
  labels = {},
}: ClaimRewardModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const defaultLabels = {
    done: "Listo",
    processing: "Procesando... 1/1",
    claimProfit: "Reclamar ganancia",
    share: "Compartir",
    shareTitle: "Recompensa en Pronóstico",
    copiedToClipboard: "Copiado al portapapeles",
    youWon: "Ganaste $",
    excellentWork: "¡Excelente trabajo prediciendo el futuro en Pronóstico!",
    purchase: "Compra $",
    won: "Ganaste",
    shareText: "¡Gané ${{amount}} prediciendo el futuro en Pronóstico!",
  };
  const l = { ...defaultLabels, ...labels };

  if (!claim) return null;

  const totalInvested = claim.to_win - claim.return_investment;
  const returnPercentage = totalInvested > 0
    ? (claim.return_investment / totalInvested) * 100
    : 0;

  const formatDate = (
    close_time_utc: string | null,
    open_time_utc: string | null
  ) => {
    const formatDateTime = (dateStr: string | null) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);

      const month = date.toLocaleString("en-US", { month: "short" });
      const day = date.getDate();

      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strMinutes = minutes < 10 ? "0" + minutes : minutes;

      return `${month} ${day}, ${hours}:${strMinutes}${ampm}`;
    };

    const openPart = formatDateTime(open_time_utc);
    const closePart = formatDateTime(close_time_utc);

    if (openPart && closePart) {
      return `${openPart} - ${closePart}`;
    }
    return closePart || openPart;
  };

  const handleShare = async () => {
    const formattedDate = formatDate(claim.close_time_utc, claim.open_time_utc);
    const amount = formatNumber(claim.to_win, 2);
    const shareTextTemplate = l.shareText || "¡Gané ${{amount}} prediciendo el futuro en Pronóstico!";
    const shareText = `${shareTextTemplate.replace("{{amount}}", amount)}\n\n${claim.title} - ${formattedDate}`;
    const shareUrl = `${window.location.origin}/${l.locale || "es"}/market/${claim.documentId}`;

    const shareData = {
      title: l.shareTitle,
      text: shareText,
      url: shareUrl,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert(l.copiedToClipboard);
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? "24px 24px 0 0" : "24px",
          padding: "32.5px",
          position: isMobile ? "fixed" : "relative",
          bottom: isMobile ? 0 : "auto",
          margin: isMobile ? 0 : "32px",
          width: "100%",
          maxWidth: isMobile ? "100%" : "381px",
          overflow: "hidden",
          backgroundImage: "none",
          backgroundColor: "var(--surface-container-low)",
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: isMobile ? "flex-end" : "center",
        },
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Trophy Icon */}
            <div className="flex justify-center mb-6 h-[83px] items-center">
              <span
                style={{ fontSize: "83px", lineHeight: 1, display: "block" }}
              >
                🏆
              </span>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-4 h-[20px]">
              <PronosticoIcon
                color="var(--primary)"
                className="h-full w-auto"
              />
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: isSuccess ? "32px" : "24px",
                fontWeight: 700,
                marginBottom: isSuccess ? "12px" : "8px",
                color: "var(--on-surface)",
              }}
            >
              {l.youWon}{formatNumber(claim.to_win, 2)}
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                lineHeight: "1.6",
                color: "var(--surface-tint)",
                marginBottom: isSuccess ? "40px" : "32px",
                padding: "0 10px",
              }}
            >
              {l.excellentWork}
            </p>

            {/* Market Card */}
            {!isSuccess && (
              <div className="w-full bg-transparent flex items-center gap-3 mb-8 text-left">
                <div className="w-[43px] h-[43px] rounded-[6px] overflow-hidden bg-[var(--surface-container-high)] flex-shrink-0">
                  {(claim.image?.url ?? claim.image_url) ? (
                    <img
                      src={(claim.image?.url ?? claim.image_url)?.trim()}
                      alt={claim.title || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[20px]">
                      📊
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-[12px] font-[700] text-[var(--on-surface)] leading-tight">
                    {claim.title}

                  </div>
                  <div className="text-[11px] font-[500] text-[var(--surface-tint)] mt-0.5">
                    {formatDate(claim.close_time_utc, claim.open_time_utc)}
                  </div>
                  <div className="text-[11px] font-[500] text-[var(--surface-tint)] mt-0.5">
                    {l.purchase}
                    {formatNumber(totalInvested, 2)} -
                    {l.won}{" "}
                    <span>
                      ${formatNumber(claim.to_win, 2)} (+
                      {formatNumber(returnPercentage, 0)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="w-full flex flex-col gap-3 items-center">
              <Button
                label={isSuccess ? l.done : isLoading ? l.processing : l.claimProfit}
                variant="modal"
                onClick={() =>
                  isSuccess ? onClose() : onClaim?.(claim.documentId)
                }
                disabled={isLoading}
                className="rounded-full"
              >
              </Button>

              {!isSuccess && (
                <Button
                  label={l.share}
                  variant="outline"
                  className="!rounded-full !h-[48px]"
                  startIcon={
                    <ShareIcon color="currentColor" width={18} height={18} />
                  }
                  onClick={handleShare}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
