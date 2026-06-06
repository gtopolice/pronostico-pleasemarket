"use client";

import { useImageRetry } from "../../../hooks/use-image-retry";
const IMAGE_SIZE = 48;
import { Skeleton } from "@mui/material";
import { MarketCardProps } from "../types/interfaces";
import { XIcon } from "../../../assets/icons";

interface HeaderProps extends MarketCardProps {
  isOpen?: boolean;
  onClose?: () => void;
}
export function Header(props: HeaderProps) {
  const { isLoading, isOpen, onClose, image } = props;
  const { imgSrc, handleError } = useImageRetry(image, "/favicon.png", 1);

  return (
    <div className="w-full flex flex-row items-center justify-between">
      <div className="w-full flex flex-row items-center justify-start gap-2">
        {isLoading ? (
          <Skeleton
            className="rounded-[8px]"
            width={45}
            height={75}
            style={{
              marginTop: "-15px",
            }}
          />
        ) : (
          <img
            src={imgSrc}
            alt="Market Card"
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
            className="rounded-[8px] object-cover"
            onError={handleError}
          />
        )}
        {isLoading ? (
          <div style={{ marginTop: "-10px" }}>
            <Skeleton className="rounded-[8px]" width={150} height={20} />
            <Skeleton className="rounded-[8px]" width={100} height={20} />
          </div>
        ) : (
          <span className="text-[var(--predictions-card-title)] text-[14px] leading-[20px] tracking-[0.1px] font-[500] line-clamp-2">
            {props.title}
          </span>
        )}
      </div>
      {isOpen && (
        <div
          className="cursor-pointer h-9"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          <XIcon
            height={14.25}
            width={14.25}
            color="var(--on-surface-variant)"
          />
        </div>
      )}
    </div>
  );
}
