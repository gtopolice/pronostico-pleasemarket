"use client";

import Image from "next/image";
import { useImageRetry } from "../../hooks/use-image-retry";

interface SearchResultsCardProps {
  imageUrl: string;
  title: string;
}

function SearchImage({ src, alt }: { src: string; alt: string }) {
  const { imgSrc, handleError } = useImageRetry(src, "/favicon.png", 1);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={48}
      height={48}
      className="rounded-[8px] w-[48px] h-[48px] object-cover"
      onError={handleError}
    />
  );
}

export function SearchResultsCard({ imageUrl, title }: SearchResultsCardProps) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <SearchImage src={imageUrl} alt={title} />
      <span className="text-[14px] leading-[20px] tracking-[0.1px] font-[500] text-[var(--primary)]">
        {title}
      </span>
    </div>
  );
}
