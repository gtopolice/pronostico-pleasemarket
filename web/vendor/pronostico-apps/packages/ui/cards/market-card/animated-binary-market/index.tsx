"use client";

import { Market } from "@pronostico-apps/interfaces";
import { MarketCardProps } from "../types/interfaces";
import Avatar from "@mui/material/Avatar";
import { SaveButton } from "../../../buttons/save-button";
import Image from "next/image";
import { Chart } from "../../../charts/chart";
import { Button } from "../../../buttons/button";
import { Selection } from "./selection";
import { Selected } from "./selected";
import { useImageRetry } from "../../../hooks/use-image-retry";
import React from "react";

export interface BinaryMarketCardProps extends MarketCardProps {
    market?: Market;
    selectedBinary: "yes" | "no" | null;
    amount: string;
    estimatedPayout: string;
    displayPrice: string;
    isTradingLoading: boolean;
    tradingError?: string | null;
    isConnected: boolean;
    onSelect: (value: "yes" | "no") => void;
    onAmountChange: (value: string) => void;
    onBuy: () => void;
    onClose: () => void;
    isFirstRender: boolean;
    isPurchasing: boolean;
    userBalance?: number;
    chartData?: Market["chart"];
    labels?: {
        yesLabel?: string;
        noLabel?: string;
        predicting?: string;
        toWin?: string;
    };
}

const px = "px-3"

const DEFAULT_CATEGORIES = ["Trending", "Nuevo"];

import { motion, AnimatePresence } from "framer-motion";
import CloseBtnIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

function MarketImage({ src, alt = "" }: { src?: string; alt?: string }) {
    const { imgSrc, handleError } = useImageRetry(src, "/favicon.png", 1);
    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 424px"
            onError={handleError}
        />
    );
}

function CategoryImage({ src, alt = "", style }: { src?: string; alt?: string; style?: React.CSSProperties }) {
    const { imgSrc, handleError } = useImageRetry(src, "/favicon.png", 1);
    return (
        <img
            src={imgSrc}
            alt={alt}
            style={style}
            onError={handleError}
        />
    );
}

const AnimatedBinaryMarketImpl = (props: BinaryMarketCardProps) => {
    // Default labels
    const defaultLabels = {
        yesLabel: "SI",
        noLabel: "NO",
        predicting: "Pronosticando...",
        toWin: "Para ganar",
    };
    const l = { ...defaultLabels, ...props.labels };

    // get the most recent date
    const mostRecentDate = props.chartData?.reduce((acc, curr) => {
        return curr.x > acc.x ? curr : acc;
    }, props.chartData?.[0]);

    // Transform probability based on selectedShare (like chart does)
    const displayProbability = React.useMemo(() => {
        if (!mostRecentDate) return null;
        if (props.selectedShare === "NO") {
            return 100 - mostRecentDate.y;
        }
        return mostRecentDate.y;
    }, [mostRecentDate, props.selectedShare]);

    // Color for the probability label - matches chart color based on selectedShare
    const probabilityColor = React.useMemo(() => {
        if (typeof window !== "undefined") {
            return props.selectedShare === "NO" 
                ? getComputedStyle(document.documentElement).getPropertyValue("--color-no").trim()
                : getComputedStyle(document.documentElement).getPropertyValue("--color-yes").trim();
        }
        return "var(--color-yes)";
    }, [props.selectedShare]);

    const handleOnCardClick = () => {
        props.onClick?.(props.id);
    };


    const showSelectedCategory = DEFAULT_CATEGORIES.includes(props.selectedCategory?.name || "") ? false : true;


    const categoryName = showSelectedCategory ? props.selectedCategory?.name : props.market?.category?.name || "Categoría";
    const categoryImage = showSelectedCategory ? props.selectedCategory?.image?.url : props.market?.category?.image?.url || props.market?.image?.url || "/favicon.png";
    const categoryType = showSelectedCategory ? props.selectedCategory?.type : props.market?.category?.type || "";
    const lgHeight = props?.market?.resolution_result ? "lg:h-[420px]" : "lg:h-[522px]";

    const isIconCategory = [
        "Tecnología", "Tecnologia",
        "Noticias",
        "Economía", "Economia",
        "Clima",
        "Salud",
        "Chismes",
        "Cripto",
        "Energía", "Energia",
        "Deportes",
        "Política", "Politica",
        "Entretenimiento",
        "Música", "Musica",
        "Crypto", "Seguridad"
    ].includes(categoryName || "");

    return (
        <div className={`w-full max-w-[424px] border border-[var(--outline-variant)] rounded-[12px] py-4 flex flex-col gap-4 ${lgHeight} overflow-hidden`}>
            {/* Header */}
            <div className={`${px} flex flex-center items-center justify-between gap-2`}>
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleOnCardClick}
                >
                    {props.isLoading ? (
                        <Skeleton variant="circular" width={40} height={40} />
                    ) : (
                        <Avatar
                            alt={categoryName || "Categoría"}
                            src={isIconCategory ? undefined : categoryImage}
                            sx={{
                                backgroundColor: "#2958FF",
                                "& img": {
                                    objectFit: isIconCategory ? "contain" : "cover",
                                }
                            }}
                        >
                            {isIconCategory && (
                                <CategoryImage
                                    src={categoryImage}
                                    alt={categoryName || "Categoría"}
                                    style={{
                                        width: "65%",
                                        height: "65%",
                                        objectFit: "contain"
                                    }}
                                />

                            )}
                        </Avatar>
                    )}
                    <div className="flex flex-col">
                        {props.isLoading ? (
                            <>
                                <Skeleton variant="text" width={100} height={20} />
                                <Skeleton variant="text" width={80} height={16} />
                            </>
                        ) : (
                            <>
                                <span className="font-[500] text-[16px] leading-[24px] tracking-[0.15px] text-[var(--on-surface)]">
                                    {categoryName}
                                </span>
                                <span className="text-[12px] leading-[16px] tracking-[0.4px] text-[var(--on-surface)] font-[400]">
                                    {categoryType}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {!props.isLoading && (
                    props.selectedBinary ? (
                        <IconButton onClick={props.onClose} size="small">
                            <CloseBtnIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    ) : (
                        props.showSaveButton && (
                            <SaveButton
                                isActivated={props.is_marked}
                                inactiveBg="transparent"
                                onlyIcon={true}
                                activeColor="var(--tertiary)"
                                inactiveColor="#878585"
                                showFilledIconWhenActivated={true}
                                iconSize={25}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    props.onBookMark?.(!props.is_marked);
                                }}
                            />
                        )
                    )
                )}
            </div>

            {/* Body */}
            <div
                className="flex flex-col gap-3 w-full cursor-pointer"
                onClick={handleOnCardClick}
            >
                <div className="relative w-full h-[185px]">
                    {props.isLoading ? (
                        <Skeleton variant="rectangular" width="100%" height="100%" />
                    ) : (
                        <MarketImage
                            src={props.image}
                            alt={props.market?.title || "Market image"}
                        />

                    )}
                </div>
                <div className={`${px} flex flex-col gap-1`}>
                    {props.isLoading ? (
                        <>
                            <Skeleton variant="text" width="90%" height={24} />
                            <div className="flex flex-row items-center justify-between">
                                <Skeleton variant="text" width={100} height={16} />
                                <Skeleton variant="text" width={60} height={16} />
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-[16px] leading-[24px] line-clamp-2 tracking-[0.15px] text-[var(--on-surface)] font-[700] h-[50px]">
                                {props.market?.title}
                            </span>
                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[12px] leading-[16px] tracking-[0.4px] font-[700]" style={{ color: probabilityColor }}>
                                    {displayProbability}% probabilidad
                                </span>
                                <span className="text-[12px] leading-[16px] tracking-[0.4px] text-[var(--outline)] font-[400]">
                                    ${props.market?.volume} Vol
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className={`${px} flex flex-col w-full relative z-50`}>
                <AnimatePresence mode="wait">
                    {props.market?.resolution_result ? (
                        <motion.div
                            key="resolved"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <Button
                                className="rounded-full"
                                variant={props.market.resolution_result === "YES" ? "primary" : "secondary"}
                                startIcon={props.market.resolution_result === "YES" ? <CheckIcon sx={{ fontSize: "16px" }} /> : <CloseIcon sx={{ fontSize: "16px" }} />}
                                label={props.market.resolution_result === "YES" ? l.yesLabel : l.noLabel}
                                disabled={true}
                            />
                        </motion.div>
                    ) : props.selectedBinary ? (
                        <motion.div
                            key="selected"
                            initial={props.isFirstRender ? false : { x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full flex flex-col gap-3"
                        >
                            <Selected
                                amount={props.amount}
                                onAmountChange={props.onAmountChange}
                                estimatedPayout={props.estimatedPayout}
                            />
                            {props.tradingError && (
                                <div className="text-[12px] text-red-500 px-2">
                                    {props.tradingError}
                                </div>
                            )}
                            <Button
                                className="rounded-full"
                                variant={props.selectedBinary === "yes" ? "primary" : "secondary"}
                                startIcon={props.selectedBinary === "yes" ? <CheckIcon sx={{ fontSize: "16px" }} /> : <CloseIcon sx={{ fontSize: "16px" }} />}
                                label={`${props.selectedBinary === "yes" ? l.yesLabel : l.noLabel} ${Math.round(parseFloat(props.displayPrice) * 100)}¢`}
                                labelBottom={
                                    props.isPurchasing
                                        ? "Pronosticando..."
                                        : `Para ganar $${props.estimatedPayout}`
                                }
                                isActive={props.selectedBinary !== null}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    props.onBuy();
                                }}
                                disabled={
                                    props?.market?.visibility === "UNLISTED" ||
                                    (props?.market?.close_time_utc
                                        ? new Date(props.market.close_time_utc).getTime()
                                        : 0) < Date.now() ||
                                    props?.market?.resolution_result !== null ||
                                    props.isTradingLoading ||
                                    parseFloat(props.amount) < 1 ||
                                    !props.isConnected ||
                                    parseFloat(props.estimatedPayout) <= 0 ||
                                    (props.userBalance ?? 0) < parseFloat(props.amount)
                                }
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="selection"
                            initial={props.isFirstRender ? false : { x: "-100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full flex flex-col gap-3"
                        >
                            {props.isLoading ? (
                                <Skeleton variant="rectangular" width="100%" height={65} sx={{ borderRadius: "8px" }} />
                            ) : (
                                <Chart
                                    data={props.chartData ?? []}
                                    showDates={false}
                                    showPercentages={false}
                                    showGrid={false}
                                    showHeader={false}
                                    showFooter={false}
                                    height={80}
                                    noPadding={true}
                                />
                            )}
                            <Selection
                                onSelect={props.onSelect}
                                isLoading={props.isLoading}
                                disabled={props.disabled || props?.market?.visibility === "UNLISTED" ||
                                    (props?.market?.close_time_utc
                                        ? new Date(props.market.close_time_utc).getTime()
                                        : 0) < Date.now() ||
                                    props?.market?.resolution_result !== null}
                                labels={{
                                    yesLabel: l.yesLabel,
                                    noLabel: l.noLabel,
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export const AnimatedBinaryMarket = React.memo(AnimatedBinaryMarketImpl, (prev, next) => {
    if (prev.id !== next.id) return false;
    if (prev.market?.id !== next.market?.id) return false;

    if (prev.amount !== next.amount) return false;
    if (prev.selectedBinary !== next.selectedBinary) return false;
    if (prev.isTradingLoading !== next.isTradingLoading) return false;
    if (prev.isPurchasing !== next.isPurchasing) return false;
    if (prev.isConnected !== next.isConnected) return false;
    if (prev.isLoading !== next.isLoading) return false;
    if (prev.is_marked !== next.is_marked) return false;

    // Visual/Chart data
    if (prev.market?.volume !== next.market?.volume) return false;
    if (prev.market?.chart?.length !== next.market?.chart?.length) return false;
    if (prev.chartData?.length !== next.chartData?.length) return false;

    return true;
});