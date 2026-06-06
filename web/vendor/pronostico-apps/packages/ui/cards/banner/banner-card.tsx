"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "../../buttons/button";
import Image from "next/image";
import { useImageRetry } from "../../hooks/use-image-retry";

import { Market } from "@pronostico-apps/interfaces";
import { motion, useAnimation } from "framer-motion";
import { formatNumber } from "@pronostico-apps/prediction-market";

export interface BannerCardProps {
    markets?: Market[];
    onClick?: (id: string | number) => void;
    labels?: {
        goToMarket?: string;
        probability?: string;
        volume?: string;
    };
}

const GAP = 0; // Gap between cards in pixels

function BannerImage({
    src,
    alt,
    priority
}: {
    src: string;
    alt: string;
    priority?: boolean
}) {
    const { imgSrc, handleError } = useImageRetry(src, "/og-image.png", 1);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            className="object-cover"
            priority={priority}
            onError={handleError}
        />
    );
}

export function BannerCard({ markets = [], onClick, labels = {} }: BannerCardProps) {
    const defaultLabels = {
        goToMarket: "Ir a mercado",
        probability: "probabilidad",
        volume: "Vol",
    };
    const l = { ...defaultLabels, ...labels };

    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const controls = useAnimation();

    useEffect(() => {
        if (!containerRef.current) return;
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const totalMarkets = markets.length;

    // Trigger animation when index or width changes
    useEffect(() => {
        if (containerWidth > 0) {
            controls.start({
                x: -(currentIndex * (containerWidth + GAP)),
                transition: { type: "spring", stiffness: 300, damping: 30 }
            });
        }
    }, [currentIndex, containerWidth, controls]);

    // Auto-pagination every 15 seconds
    useEffect(() => {
        if (totalMarkets <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalMarkets);
        }, 15000);

        return () => clearInterval(interval);
    }, [currentIndex, totalMarkets]);

    // Handle empty state
    if (!markets || markets.length === 0) return null;

    const paginate = (newDirection: number) => {
        const nextIndex = Math.max(0, Math.min(currentIndex + newDirection, totalMarkets - 1));
        setCurrentIndex(nextIndex);
    };

    const dragConstraintsLeft = -(containerWidth + GAP) * (totalMarkets - 1);

    return (
        <div
            ref={containerRef}
            className="w-full h-[444px] md:h-[352px] flex flex-row overflow-hidden relative cursor-grabbing"
        >
            <motion.div
                drag="x"
                dragConstraints={{ left: dragConstraintsLeft, right: 0 }}
                dragElastic={0.1}
                animate={controls}
                onDragEnd={(e, { offset, velocity }) => {
                    const swipeX = offset.x;
                    const swipeVelocity = velocity.x;

                    // If user swiped fast enough, move to next/prev
                    if (swipeVelocity < -500 && currentIndex < totalMarkets - 1) {
                        paginate(1);
                    } else if (swipeVelocity > 500 && currentIndex > 0) {
                        paginate(-1);
                    } else {
                        // Otherwise snap to the nearest card if displacement is significant (> 60% as user requested)
                        const threshold = containerWidth * 0.6;
                        if (swipeX < -threshold && currentIndex < totalMarkets - 1) {
                            paginate(1);
                        } else if (swipeX > threshold && currentIndex > 0) {
                            paginate(-1);
                        } else {
                            // IF NO THRESHOLD CROSSED, FORCE SNAP BACK TO CURRENT INDEX
                            // This fixes the "stuck at 50%" bug
                            controls.start({
                                x: -(currentIndex * (containerWidth + GAP)),
                                transition: { type: "spring", stiffness: 300, damping: 30 }
                            });
                        }
                    }
                }}
                className="flex flex-row items-center w-full h-full"
                style={{ gap: `${GAP}px` }}
            >
                {markets.map((market, idx) => {
                    const title = market.title;
                    const description = market.description;
                    const image = (market.image?.url ?? market.image_url)?.trim() || "/og-image.png";
                    const volume = market.volume || "0";
                    const probability = market.chart?.[market.chart.length - 1]?.y || 0;

                    return (
                        <div key={idx} style={{ width: containerWidth || "100vw" }} className="h-full flex-shrink-0 flex justify-center px-4 lg:px-0">
                            {/* Inner Centered Card */}
                            <div className="w-full border border-[var(--outline-variant)] max-w-[1308px] h-full flex flex-col md:flex-row md:justify-between pb-[24px] md:pb-0 bg-[var(--tertiary-container)] rounded-[12px] overflow-hidden">
                                {/* Image Section */}
                                <div className="relative w-full md:max-w-[50%] lg:max-w-[557px] h-[215px] md:h-auto flex-shrink-0 md:order-2">
                                    <BannerImage
                                        src={image?.startsWith("http") ? image : (image.startsWith("/") ? image : `/${image}`)}
                                        alt={title}
                                        priority={idx === 0}
                                    />

                                    <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[var(--tertiary-container)] to-transparent opacity-30" />

                                    {/* Creator pill — top right */}
                                    {market.creator && (
                                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full p-2">
                                            <img
                                                src={market.creator.avatar?.url || "/favicon.png"}
                                                alt=""
                                                className="w-4 h-4 rounded-full"
                                            />
                                            <span className="text-xs text-white leading-none">
                                                {market.creator.user_name || "@Pronóstico"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="flex-col justify-center px-[20px] py-[10px] sm:py-[20px] md:px-[40px] gap-4 md:gap-5 md:order-1 flex-1 flex max-w-[645px]">
                                    <div className="flex flex-col gap-1 md:gap-2 items-center md:items-start text-center md:text-left">
                                        <h1 className=" line-clamp-2 font-[700] text-[16px] md:text-[22px] lg:text-[28px] xl:text-[33px] leading-[24px] md:leading-[28px] lg:leading-[36px] xl:leading-[44px] tracking-[0.5px] md:tracking-normal text-[var(--on-tertiary-container)] min-h-[48px] sm:min-h-[70px] max-w-[306px] sm:max-w-full">
                                            {title}
                                        </h1>
                                        <p className="hidden md:line-clamp-3 lg:line-clamp-4 font-[400] text-[14px] md:text-[13px] lg:text-[14px] leading-[20px] tracking-[0.25px] text-[var(--on-tertiary-container)] m-0 opacity-90 max-w-[600px]">
                                            {description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                                        <span className="font-[700] text-[24px] md:text-[20px] lg:text-[26px] leading-[32px] md:leading-[28px] lg:leading-[36px] text-[var(--secondary-container)] flex items-center">
                                            {probability}% {l.probability}
                                        </span>
                                        <span className="font-[400] text-[12px] leading-[16px] tracking-[0.4px] text-[var(--on-tertiary-container)]">
                                            ${formatNumber(volume, 2)} {l.volume}
                                        </span>
                                    </div>

                                    <div className="w-full flex justify-center md:justify-start">
                                        <Button
                                            label={l.goToMarket}
                                            variant="primary"
                                            sx={{
                                                width: { xs: "100%", md: "316px" },
                                                height: "40px",
                                                borderRadius: "100px",
                                                backgroundColor: "var(--secondary-container) !important",
                                                color: "var(--black) !important",
                                                fontSize: "14px",
                                                fontWeight: "700",
                                                textTransform: "none",
                                                "&:hover": {
                                                    backgroundColor: "var(--secondary-container) !important",
                                                    opacity: 0.9,
                                                }
                                            }}
                                            onClick={() => market.documentId && onClick?.(market.documentId)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>


            {/* Indicators - Static centered horizontally across the card */}
            <div className="absolute bottom-[19px] md:bottom-[24px] left-0 w-full flex justify-center items-center gap-[8px] h-[8px] z-20">
                {markets.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                        }}
                        className={`${idx === currentIndex ? "w-[12px]" : "w-[8px]"} h-[8px] rounded-full cursor-pointer transition-colors duration-300`}
                        style={{
                            backgroundColor: idx === currentIndex
                                ? "var(--on-tertiary-container)"
                                : "var(--tertiary)"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}