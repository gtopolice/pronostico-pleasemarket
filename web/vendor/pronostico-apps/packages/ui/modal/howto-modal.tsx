"use client";

import * as React from "react";
import { useState } from "react";
import { Dialog, IconButton, useMediaQuery, useTheme } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@pronostico-apps/ui";

export interface HowtoModalProps {
  open: boolean;
  onClose: () => void;
  labels?: {
    step1Title?: string;
    step1Description?: string;
    step2Title?: string;
    step2Description?: string;
    step3Title?: string;
    step3Description?: string;
    next?: string;
    letsGo?: string;
  };
}

const getDefaultSteps = (l: any) => [
  {
    icon: "🗞️",
    title: l?.step1Title || "1. Escoge un mercado",
    description: l?.step1Description || "Pronostica sobre lo que sabes: elige SÍ o NO. Tu compra define el resultado esperado, con probabilidades que evolucionan en vivo según el sentimiento del mercado.",
    buttonText: l?.next || "Siguiente",
  },
  {
    icon: "🔮",
    title: l?.step2Title || "2. Realiza tu pronóstico",
    description: l?.step2Description || "Deposita en tu cuenta mediante criptomonedas, o tarjeta para empezar a pronosticar. Disfruta de total libertad sin límites de compra y con tarifas bajas.",
    buttonText: l?.next || "Siguiente",
  },
  {
    icon: "🤑",
    title: l?.step3Title || "3. Capitaliza tus aciertos",
    description: l?.step3Description || "Vende tus acciones de SÍ o NO en cualquier momento, o espera al cierre del mercado para canjear tus acciones ganadoras por $1 cada una. Crea tu cuenta y realiza tu primer pronóstico en cuestión de minutos.",
    buttonText: l?.letsGo || "¡Vamos a ello!",
  },
];

//TODO: remove this component to dialog file
export function HowtoModal({ open, onClose, labels = {} }: HowtoModalProps) {
  const defaultLabels = {
    step1Title: "1. Escoge un mercado",
    step1Description: "Pronostica sobre lo que sabes: elige SÍ o NO. Tu compra define el resultado esperado, con probabilidades que evolucionan en vivo según el sentimiento del mercado.",
    step2Title: "2. Realiza tu pronóstico",
    step2Description: "Deposita en tu cuenta mediante criptomonedas, o tarjeta para empezar a pronosticar. Disfruta de total libertad sin límites de compra y con tarifas bajas.",
    step3Title: "3. Capitaliza tus aciertos",
    step3Description: "Vende tus acciones de SÍ o NO en cualquier momento, o espera al cierre del mercado para canjear tus acciones ganadoras por $1 cada una. Crea tu cuenta y realiza tu primer pronóstico en cuestión de minutos.",
    next: "Siguiente",
    letsGo: "¡Vamos a ello!",
  };
  const l = { ...defaultLabels, ...labels };
  const steps = getDefaultSteps(l);

  const [currentStep, setCurrentStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset step after closing animation
    setTimeout(() => setCurrentStep(0), 300);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      // maxWidth="xs"
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
      <div style={{ position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{ fontSize: "83px", marginBottom: "24px", lineHeight: 1 }}
            >
              {steps[currentStep].icon}
            </motion.div>

            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "var(--on-surface)",
                fontFamily: "inherit",
              }}
            >
              {steps[currentStep].title}
            </h2>

            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                lineHeight: "1.6",
                color: "var(--surface-tint)",
                marginBottom: "32px",
                padding: "0 10px",
                minHeight: "80px",
              }}
            >
              {steps[currentStep].description}
            </p>

            <Button
              label={steps[currentStep].buttonText}
              variant="modal"
              onClick={handleNext}
              className="rounded-full"
            >

            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </Dialog>
  );
}
