"use client";

import Button from "@mui/material/Button";
import { useTheme } from "@pronostico-apps/ui";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Image from "next/image";
import { Logo } from "../logo/logo";
import { BottomSheet } from "../bottom-sheet/bottom-sheet";
import { TelegramIcon } from "../assets/icons";

interface WelcomeDialogProps {
    open: boolean;
    onClose: () => void;
    onTelegramClick?: () => void;
}

export function WelcomeDialog({
    open,
    onClose,
    onTelegramClick,
}: WelcomeDialogProps) {
    const theme = useTheme();
    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            aria-describedby="prediction-done-dialog-description"
            maxHeight={"455px"}
        >
            <DialogContent className="gap-5 flex flex-col items-center"
                sx={{
                    px: "p-0 sm:p-5",
                }}>
                <div className="flex flex-col items-center gap-1">
                    <Image src="/assets/gift.png" alt="Gift Image" width={68} height={68} />
                    <Logo variant={theme?.theme === "dark" ? "white" : "black"} width={153.32} height={28.16} />
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
                    ¡Bienvenido a la Testnet!
                </DialogContentText>
                <div className="flex flex-col items-center gap-3">
                    <DialogContentText
                        id="prediction-done-dialog-description"
                        sx={{
                            color: "var(--surface-tint)",
                            fontSize: "12px",
                            fontWeight: 700,
                            lineHeight: "16px",
                            letterSpacing: "0.4px",
                            textAlign: "center",
                            mb: 0,
                            maxWidth: "250px",
                        }}
                    >
                        ¡Gracias por sumarte! Tus beneficios de Testnet te esperan:
                    </DialogContentText>
                    <div className="flex flex-col items-start gap-1 w-full max-w-[280px]">
                        {[
                            "🎖️ Badge Especial único para fundadores.",
                            "📈 Puntos para el Leaderboard de Mainnet.",
                            "💬 Acceso al Telegram privado con el team.",
                        ].map((item, index) => (
                            <DialogContentText
                                key={index}
                                sx={{
                                    color: "var(--surface-tint)",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    lineHeight: "16px",
                                    letterSpacing: "0.4px",
                                    textAlign: "left",
                                    mb: 0,
                                }}
                            >
                                {item}
                            </DialogContentText>
                        ))}
                    </div>

                </div>
                <div className="flex flex-col items-center gap-3 w-full">
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
                        Ok
                    </Button>
                    <Button
                        onClick={onTelegramClick}
                        variant="outlined"
                        disableElevation
                        startIcon={<TelegramIcon color="var(--primary)" width={18} height={14} />}
                        sx={{
                            borderRadius: "100px",
                            color: "var(--primary)",
                            px: 4,
                            textTransform: "none",
                            width: "100%",
                            fontWeight: 600,
                            borderColor: "var(--outline)",
                        }}
                    >
                        Ir a Telegram
                    </Button>
                </div>
            </DialogContent>
        </BottomSheet>
    );
}
