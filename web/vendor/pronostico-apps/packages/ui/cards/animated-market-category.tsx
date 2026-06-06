"use client";

import { Skeleton } from "@mui/material";
import Image from "next/image";
import { useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import { useImageRetry } from "../hooks/use-image-retry";

export interface MarketCategoryCardProps {
    image: string;
    marketName: string;
    isActive?: boolean;
    onCLick?: () => void;
    isLoading?: boolean;
    index?: number;
    borderThickness?: number;
    borderGap?: number;
    gradientAngle?: number;
    disabledBorder?: boolean;
    hasUnseen?: boolean;
    scrollProgress?: any; // We use any to avoid importing MotionValue types if not available, though it's usually preferred.
    disabled?: boolean; // Disables animation (used for iOS Mobile to avoid scroll bounce)
    isMobile?: boolean; // Used to determine base card size
}


function CategoryIconImage({ src, alt, style }: { src?: string; alt?: string; style?: any }) {
    const normalizedSrc = src ? (src.startsWith("http") ? src : (src.startsWith("/") ? src : `/${src}`)) : src;
    const { imgSrc, handleError } = useImageRetry(normalizedSrc, "/favicon.png", 1);
    return (
        <motion.img
            src={imgSrc}
            alt={alt}
            className="object-contain"
            style={style}
            loading="eager"
            onError={handleError}
        />
    );
}

function CategoryCircleImage({ src, alt }: { src?: string; alt?: string }) {
    const normalizedSrc = src ? (src.startsWith("http") ? src : (src.startsWith("/") ? src : `/${src}`)) : src;
    const { imgSrc, handleError } = useImageRetry(normalizedSrc, "/favicon.png", 1);
    return (
        <Image
            src={imgSrc}
            alt={alt || ""}
            fill
            className="object-cover"
            priority={true}
            onError={handleError}
        />
    );
}

export function AnimatedMarketCategory({
    image,
    marketName,
    isActive = false,
    onCLick,
    isLoading = false,
    index,
    borderThickness = 4,
    borderGap = 3,
    gradientAngle = 180,
    disabledBorder = false,
    hasUnseen = false,
    scrollProgress,
    disabled = false,
    isMobile = true,
}: MarketCategoryCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Internal fallback if no scrollProgress is provided
    const { scrollY: windowScrollY } = useScroll();
    const internalCustomScrollY = useMotionValue(0);
    const internalScrollY = useTransform([windowScrollY, internalCustomScrollY], ([v1, v2]) =>
        Math.max(Number(v1), Number(v2))
    );

    const internalSmoothProgress = useSpring(internalScrollY, {
        stiffness: 400,
        damping: 40,
        restDelta: 0.001
    });

    // Use passed progress or internal one
    const progress = scrollProgress || internalSmoothProgress;

    useEffect(() => {
        if (scrollProgress) return; // Don't add listener if using external progress

        const handleCustomScroll = (e: Event) => {
            const customEvent = e as CustomEvent<{ scrollTop: number }>;
            if (customEvent.detail && typeof customEvent.detail.scrollTop === "number") {
                internalCustomScrollY.set(customEvent.detail.scrollTop);
            }
        };

        if (typeof window !== "undefined") {
            window.addEventListener("mainScroll", handleCustomScroll);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("mainScroll", handleCustomScroll);
            }
        };
    }, [scrollProgress]);

    // On iOS Mobile, disable animation to avoid scroll bounce/rebound effects
    // USE ONLY the disabled and isMobile props from header - that's the source of truth
    // Do NOT do internal detection here as it causes flash/re-render issues
    const shouldDisableAnimation = disabled === true;

    const multiplierAnimationSize = 0.75;
    // Calculate base size based on device:
    // - disabled (iOS): 65.52px (smallest - no animation)
    // - enabled + mobile: 72.8px 
    // - enabled + desktop: 94.54px
    const baseSize = shouldDisableAnimation ? 65.52 : (isMobile ? 72.8 : 94.54);
    const initialCardSize = baseSize;
    const initialImageSize = initialCardSize * 0.65;

    // Target sizes (reduce by 25% = 75% of original) — only used when animation is enabled
    const targetCardSize = initialCardSize * multiplierAnimationSize;
    const targetImageSize = initialImageSize * multiplierAnimationSize;

    // On iOS Mobile: use fixed sizes (no animation) to avoid scroll bounce/rebound
    // Note: useTransform must be called unconditionally (hooks rule) — we select the value later
    const initialTextSize = shouldDisableAnimation ? 10 : (isMobile ? 10 : 12);
    const targetTextSize = initialTextSize - 2;
    const animatedCardSize = useTransform(progress, [0, 300], [initialCardSize, targetCardSize]);
    const animatedImageSize = useTransform(progress, [0, 300], [initialImageSize, targetImageSize]);
    const animatedTextSize = useTransform(progress, [0, 300], [initialTextSize, targetTextSize]);

    // Dynamically choose between CSS variables (for clean hydration) and JS values (for smooth animation)
    // We use useTransform with a function to create a MotionValue that adapts in real-time
    const cardSize = useTransform(progress, (v) => {
        const val = v as number;
        if (shouldDisableAnimation) return initialCardSize;
        if (val <= 0) return "var(--card-size)";
        return animatedCardSize.get();
    });

    const imageSize = useTransform(progress, (v) => {
        const val = v as number;
        if (shouldDisableAnimation) return initialImageSize * 0.7;
        if (val <= 0) return "var(--image-size)";
        return animatedImageSize.get() * 0.7;
    });

    const textSize = useTransform(progress, (v) => {
        const val = v as number;
        if (shouldDisableAnimation) return targetTextSize;
        if (val <= 0) return "var(--text-size)";
        return animatedTextSize.get();
    });


    const textColor =
        isActive && !isLoading
            ? "text-[var(--primary)]"
            : "text-[var(--on-primary-container)]";

    const bgColor =
        isActive && !isLoading
            ? "bg-[var(--secondary-container)]"
            : "bg-[#2958FF]";

    const gradient = `conic-gradient(from ${gradientAngle}deg, #F2FE67, #2958FF, #F2FE67)`;
    const borderColor = hasUnseen ? gradient : "#D9D9D9";

    const finalBorderThickness = borderThickness;
    const finalBorderGap = borderGap;

    const isIconCategory = [
        "Tecnología", "Tecnologia", "Technology",
        "Noticias", "News", "Notícias",
        "Economía", "Economia", "Economy",
        "Clima", "Weather",
        "Salud", "Health", "Saúde",
        "Chismes", "Gossip", "Fofoca",
        "Cripto",
        "Energía", "Energia", "Energy",
        "Deportes", "Sports", "Desportos",
        "Política", "Politica", "Politics",
        "Entretenimiento", "Entertainment", "Entretenimento",
        "Música", "Musica", "Music",
        "Crypto",
        "Seguridad", "Security", "Segurança",
        "Todos", "Todo", "Todos los mercados", "All",
        "Otros",
        "Otro",
        "General",
        "Cultura", "Culture", "Cultura",
        "Ciencia", "Science", "Ciência"
    ].includes(marketName);

    return (
        <div
            ref={cardRef}
            onClick={onCLick}
            className={`market-category-container flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer [--card-size:72.8px] sm:[--card-size:94.54px] [.is-ios_&]:[--card-size:65.52px] [--image-size:calc(var(--card-size)*0.455)] [--text-size:10px] sm:[--text-size:12px] [.is-ios_&]:[--text-size:6px] ${index === 0 ? "ml-1 sm:ml-0" : ""}`}
            style={{ width: "fit-content" }}
        >
            <motion.div
                className="rounded-full flex items-center justify-center relative overflow-hidden"
                style={{
                    // Reactive style with CSS variable fallback for hydration
                    width: cardSize,
                    height: cardSize,
                    minWidth: "auto",
                    minHeight: "auto",
                    flexShrink: 0,
                    background: borderColor,
                    padding: `${finalBorderThickness}px`,
                }}
            >
                <div
                    className="w-full h-full rounded-full flex items-center justify-center bg-[var(--background)]"
                    style={{
                        padding: `${finalBorderGap}px`,
                        width: "100%",
                        height: "100%"
                    }}
                >
                    <div
                        className={`flex items-center justify-center rounded-full transition-colors relative w-full h-full overflow-hidden ${bgColor}`}
                        style={{
                            width: "100%",
                            height: "100%"
                        }}
                    >
                        {isLoading ? (
                            // Size based on disabled and isMobile props (from header - no JS detection delay)
                            <Skeleton
                                variant="circular"
                                width="100%"
                                height="100%"

                            />
                        ) : isIconCategory ? (
                            // Use the core market-category-card logic for Icons (small centered image)
                            // When imageSize is undefined (animation disabled), let CSS control via --image-size
                            <CategoryIconImage
                                src={image}
                                alt={marketName}
                                style={{
                                    width: imageSize,
                                    height: imageSize,
                                }}
                            />
                        ) : (
                            // Use the animated-market-category logic for People (full circle image)
                            <motion.div
                                className={"relative w-full h-full rounded-full overflow-hidden"}
                                style={{
                                    scale: 1, // People look better slightly larger but contained
                                }}
                            >
                                <CategoryCircleImage
                                    src={image}
                                    alt={marketName}
                                />
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Category Name */}
            <div className="flex items-center justify-center">
                {!isLoading && (
                    <motion.span
                        className={`leading-[12px] sm:leading-[14px] tracking-[0.5px] font-[500] ${textColor} text-center`}
                        style={{ fontSize: textSize as any }}
                    >
                        {marketName}
                    </motion.span>
                )}
            </div>
        </div>
    );
}