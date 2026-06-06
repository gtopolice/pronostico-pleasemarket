"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { PeopleHuggingIcon } from "../assets/icons";
import { Logo } from "../logo/logo";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme, Button } from "@pronostico-apps/ui";

// Detect mobile at module load time (for initial value)
const getInitialMobile = () => typeof window !== "undefined" ? window.innerWidth < 600 : true;

export interface ReferredToTestnetModalProps {
    open: boolean;
    onClose: () => void;
    onClaim?: () => Promise<boolean>;
    onCopyReferralLink?: () => void;
    referrals_amount?: number;
    un_claimed_rewards?: number;
    labels?: {
        title?: string;
        description1?: string;
        description2?: string;
        totalReferrals?: string;
        pendingReferrals?: string;
        claimedReferrals?: string;
        claiming?: string;
        claim?: string;
        copyLink?: string;
    };
}


export function ReferredToTestnetModal({
    open,
    onClose,
    onClaim,
    onCopyReferralLink,
    referrals_amount = 0,
    un_claimed_rewards = 0,
    labels = {}
}: ReferredToTestnetModalProps) {
    const theme = useTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [isMobile, setIsMobile] = useState(getInitialMobile());
    const [isClaiming, startTransition] = useTransition();

    // Update on resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 600);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleClose = () => {
        // Reset step after closing animation
        onClose();
        setTimeout(() => setCurrentStep(0), 300);
    };

    const handleClaim = () => {
        startTransition(async () => {
            await onClaim?.();
        });
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
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
            <div className="relative w-full flex justify-center">
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: -16,
                        top: -16,
                        color: "var(--on-surface-variant)",
                    }}
                >
                    <CloseIcon sx={{ fontSize: "18px", color: "var(--foreground)" }} />
                </IconButton>
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
                        className="flex flex-col text-center items-center gap-5 max-w-[316px]"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="flex flex-col gap-2"
                        >
                            <div className="flex flex-row justify-center">
                                <PeopleHuggingIcon width={68} height={68} />
                            </div>
                            <Logo variant={theme?.theme === "dark" ? "white" : "black"} width={153.32} height={23.53} />
                        </motion.div>

                        <span
                            style={{
                                fontSize: "24px",
                                lineHeight: "32px",
                                letterSpacing: "0px",
                                fontWeight: 700,
                                color: "var(--primary)",
                                fontFamily: "inherit",
                            }}
                        >
                            {labels.title || "¡Gana por referir amigos!"}
                        </span>

                        <span
                            className="text-[12px] leading-[16px] tracking-[0.4px] text-[var(--surface-tint)] font-[700]"
                        >
                            {labels.description1 || "Recibe $100 USD de prueba por cada amigo que refieras y se unan a la plataforma."}
                        </span>
                        <span
                            className="text-[12px] leading-[16px] tracking-[0.4px] text-[var(--surface-tint)] font-[700]"
                        >
                            {labels.description2 || "Entre más amigos invites más posibilidades de ganar premios sorpresa al final de la Testnet."}
                        </span>

                        <div className="flex flex-col w-full text-left">
                            <span className="text-[12px] leading-[16px] tracking-[0.4px] text-[var(--primary)] font-[400]">
                                {labels.totalReferrals || "Referidos totales:"} <span className="font-[700]">{referrals_amount}</span>
                            </span>
                            <span className="text-[12px] leading-[16px] tracking-[0.4px] text-[var(--primary)] font-[400]">
                                {labels.pendingReferrals || "Referidos por reclamar:"} <span className="font-[700]">{un_claimed_rewards}</span>
                            </span>
                            <span className="text-[12px] leading-[16px] tracking-[0.4px] text-[var(--primary)] font-[400]">
                                {labels.claimedReferrals || "Referidos reclamados:"} <span className="font-[700]">{referrals_amount - un_claimed_rewards}</span>
                            </span>
                        </div>

                        <div className="flex flex-col w-full gap-3">
                            <Button
                                variant="modal"
                                disableElevation
                                disabled={un_claimed_rewards === 0 || isClaiming}
                                onClick={handleClaim}
                                label={isClaiming ? (labels.claiming || "Reclamando...") : (labels.claim || "Reclamar")}
                                className="rounded-full"
                            // sx={{
                            //     width: "100%",
                            //     padding: "14px",
                            //     borderRadius: "100px",
                            //     backgroundColor: "var(--primary)",
                            //     color: "var(--on-primary)",
                            //     fontSize: "14px",
                            //     fontWeight: 500,
                            //     fontStyle: "medium",
                            //     lineHeight: "20px",
                            //     letterSpacing: "0.1px",
                            //     border: "none",
                            //     cursor: "pointer",
                            //     transition: "all 0.2s ease",
                            //     boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                            //     textTransform: "none",
                            //     "&.Mui-disabled": {
                            //         backgroundColor: "#1D1B201F",
                            //         opacity: 1, // Ensure the color isn't further faded if the background already is
                            //     },
                            // }}
                            >
                            </Button>
                            <Button
                                variant="outline"
                                disableElevation
                                startIcon={<ContentCopyOutlinedIcon />}
                                onClick={onCopyReferralLink}
                                label={labels.copyLink || "Copiar link referidos"}
                                className="rounded-full"
                            // sx={{
                            //     width: "100%",
                            //     padding: "14px",
                            //     borderRadius: "100px",
                            //     backgroundColor: "transparent",
                            //     color: "var(--primary)",
                            //     fontSize: "14px",
                            //     fontWeight: 500,
                            //     fontStyle: "medium",
                            //     lineHeight: "20px",
                            //     letterSpacing: "0.1px",
                            //     cursor: "pointer",
                            //     textTransform: "none",
                            //     border: "1px solid var(--outline)",
                            // }}
                            >
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </Dialog>
    );
}
