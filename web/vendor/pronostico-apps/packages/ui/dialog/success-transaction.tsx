"use client";

import { Dialog, useMediaQuery, useTheme, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export interface SuccessTransactionDialogProps {
    open: boolean;
    onClose: () => void;
    hash?: string;
    labels?: {
        close?: string;
    };
}

export function SuccessTransactionDialog({
    open,
    onClose,
    hash,
    labels = {}
}: SuccessTransactionDialogProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const defaultLabels = {
        close: "Cerrar",
    };
    const l = { ...defaultLabels, ...labels };

    const handleClose = () => {
        onClose();
    };

    const truncateHash = (str: string) => {
        if (!str) return "";
        if (str.length <= 21) return str;
        return `${str.slice(0, 8)}...${str.slice(-11)}`;
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
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="flex flex-col text-center items-center gap-5 w-full"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="flex flex-col gap-2"
                        >
                            <div className="flex flex-row justify-center">
                                <Image
                                    src="/assets/checked.png"
                                    alt="Success icon"
                                    width={83}
                                    height={83}
                                />
                            </div>
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
                            Transacción exitosa
                        </span>

                        <div className="flex flex-col gap-1">
                            <span
                                className="text-[12px] leading-[16px] tracking-[0.4px] text-[var(--surface-primary)] font-[700]"
                            >
                                Transaction completada exitosamente
                            </span>
                            {hash && (
                                <span
                                    className="text-[12px] leading-[16px] tracking-[0.4px] text-[var(--surface-tint)] font-[400]"
                                >
                                    Hash: {truncateHash(hash)}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col w-full gap-3 mt-2">
                            <Button
                                disableElevation
                                onClick={handleClose}
                                sx={{
                                    width: "100%",
                                    padding: "14px",
                                    borderRadius: "100px",
                                    backgroundColor: "var(--primary)",
                                    color: "var(--on-primary)",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    fontStyle: "medium",
                                    lineHeight: "20px",
                                    letterSpacing: "0.1px",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                                    textTransform: "none",
                                    "&:hover": {
                                        backgroundColor: "var(--primary)",
                                        opacity: 0.9,
                                    }
                                }}
                            >
                                {l.close}
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </Dialog>
    );
}