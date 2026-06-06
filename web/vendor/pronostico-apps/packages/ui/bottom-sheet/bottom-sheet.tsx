"use client";

import * as React from "react";
import Dialog from "@mui/material/Dialog";
import Paper, { PaperProps } from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import { motion, PanInfo, useAnimation } from "framer-motion";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  height?: string | number;
  maxHeight?: string | number;
}

export function BottomSheet({
  open,
  onClose,
  children,
  maxWidth = "xs",
  height = "100%",
  maxHeight = "328px",
}: BottomSheetProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const controls = useAnimation();

  const handleClose = React.useCallback(async () => {
    if (isMobile) {
      await controls.start({
        y: "100%",
        transition: { type: "spring", damping: 25, stiffness: 200 },
      });
    }
    onClose();
  }, [isMobile, controls, onClose]);

  // Reset position when opening
  React.useEffect(() => {
    if (open) {
      controls.set({ y: 0 });
    }
  }, [open, controls]);

  const DraggablePaper = React.useMemo(() => {
    const MotionPaper = Paper as any;
    return function DraggablePaperComponent(props: PaperProps) {
      return (
        <MotionPaper
          {...props}
          component={motion.div}
          animate={controls}
          drag={isMobile ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.1, bottom: 0.8 }}
          onDragEnd={async (_: any, info: PanInfo) => {
            if (info.offset.y > 100 || info.velocity.y > 500) {
              handleClose();
            } else {
              controls.start({
                y: 0,
                transition: { type: "spring", damping: 25, stiffness: 300 },
              });
            }
          }}
        />
      );
    };
  }, [isMobile, handleClose, controls]);

  return (
    <Dialog
      open={open}
      TransitionComponent={isMobile ? undefined : Transition}
      PaperComponent={DraggablePaper}
      keepMounted
      onClose={handleClose}
      fullWidth
      maxWidth={isMobile ? false : maxWidth}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: isMobile
            ? "none"
            : maxWidth === false
              ? "none"
              : theme.breakpoints.values[
                  maxWidth as "xs" | "sm" | "md" | "lg" | "xl"
                ] || "381px",
          height: isMobile ? "auto" : height,
          maxHeight: isMobile ? "90vh" : maxHeight,
          borderRadius: isMobile ? "28px 28px 0 0" : "12px",
          padding: isMobile ? "8px 16px 24px 16px" : "16px",
          backgroundColor: "var(--surface-container-low)",
          margin: isMobile ? 0 : 2,
          position: isMobile ? "fixed" : "relative",
          bottom: isMobile ? 0 : "auto",
          backgroundImage: "none", // Remove MUI Paper default overlay in dark mode
        },
      }}
    >
      {isMobile && (
        <Box
          sx={{
            width: "32px",
            height: "4px",
            backgroundColor: "var(--outline)",
            borderRadius: "100px",
            margin: "12px auto 0 auto",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </Dialog>
  );
}
