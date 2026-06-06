"use client";

import { Skeleton } from "@mui/material";

export interface MarketCategoryCardProps {
  image: string;
  marketName: string;
  isActive?: boolean;
  onCLick?: () => void;
  isLoading?: boolean;
  index?: number;
}

const CARD_SIZE = 68;
const IMAGE_SIZE = CARD_SIZE * 0.45;

import { useImageRetry } from "../hooks/use-image-retry";

export function MarketCategoryCard({
  image,
  marketName,
  isActive = false,
  onCLick,
  isLoading = false,
  index,
}: MarketCategoryCardProps) {
  const { imgSrc, handleError } = useImageRetry(image, "/favicon.png", 1);

  const finalImageSize = IMAGE_SIZE;
  const finalCardSize = CARD_SIZE;

  const textColor =
    isActive && !isLoading
      ? "text-[var(--primary)]"
      : "text-[var(--on-primary-container)]";

  const bgColor =
    isActive && !isLoading
      ? "bg-[var(--secondary-container)]"
      : "bg-[var(--tertiary-container)]";

  return (
    <div
      onClick={onCLick}
      className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${index === 0 ? "ml-1 sm:ml-0" : ""}`}
      style={{ width: "fit-content" }}
    >
      {/* Image Container */}
      <div
        className={`rounded-full flex items-center justify-center ${bgColor} transition-colors`}
        style={{
          width: `${finalCardSize}px`,
          height: `${finalCardSize}px`,
        }}
      >
        {isLoading ? (
          <Skeleton
            variant="circular"
            width={finalImageSize}
            height={finalImageSize}
          />
        ) : (
          <img
            src={imgSrc}
            alt={marketName}
            className="object-contain"
            onError={handleError}

            style={{
              width: `${finalImageSize}px`,
              height: `${finalImageSize}px`,
            }}
          />
        )}
      </div>

      {/* Category Name */}
      <div className="flex items-center justify-center">
        {!isLoading && (
          <span
            className={`text-[12px] leading-[16px] tracking-[0.5px] font-[500] ${textColor} text-center`}
          >
            {marketName}
          </span>
        )}
      </div>
    </div>
  );
}