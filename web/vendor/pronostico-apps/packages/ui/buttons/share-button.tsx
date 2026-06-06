"use client";

import { Button as MuiButton, IconButton } from "@mui/material";
import { ShareIcon } from "../assets/icons";

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  onShareSuccess?: () => void;
  onShareError?: (error: unknown) => void;
  label?: string;
}

export function ShareButton({
  title,
  text,
  url,
  onShareSuccess,
  onShareError,
  label = "Compartir",
}: ShareButtonProps) {
  const handleShare = async () => {
    // console.log("share", url);
    const shareData = {
      title: title || document.title,
      text: text || "",
      url: url || window.location.href,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        onShareSuccess?.();
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url);
        onShareSuccess?.();
        // You might want to show a toast here, but for now we just log
        // console.log("Link copied to clipboard");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
        onShareError?.(error);
      }
    }
  };

  return (
    <div>
      <div className="hidden sm:block">
        <MuiButton
          variant="outlined"
          disableElevation
          onClick={handleShare}
          startIcon={<ShareIcon color="var(--primary)" />}
          sx={{
            backgroundColor: "transparent",
            boxShadow: "none",
            textTransform: "none",
            display: "flex",
            alignItems: "center",
            color: "var(--primary)",
            fontSize: "14px",
            fontWeight: "500",
            lineHeight: "20px",
            letterSpacing: "0.1px",
            padding: "8px 15px",
            borderRadius: "100px",
            border: "1px solid var(--outline)",
            "& .MuiButton-startIcon": {
              marginBottom: "2px",
              display: "flex",
              alignItems: "center",
            },
            "&:hover": {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
          }}
        >
          {label}
        </MuiButton>
      </div>

      <div className="block sm:hidden">
        <IconButton
          onClick={handleShare}
          sx={{
            backgroundColor: "transparent",
            borderRadius: "100px",
            border: "1px solid var(--outline)",
          }}
        >
          <ShareIcon color="var(--primary)" height={15} width={15} />
        </IconButton>
      </div>
    </div>
  );
}
