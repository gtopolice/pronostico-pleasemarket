"use client";

import { useEffect, useState } from "react";

import { DEFAULT_MARKET_IMAGE } from "@/lib/fake-market-data";

type MarketHeroImageProps = {
  src: string;
  alt: string;
};

export function MarketHeroImage({ src, alt }: MarketHeroImageProps) {
  const [activeSrc, setActiveSrc] = useState(src || DEFAULT_MARKET_IMAGE);

  useEffect(() => {
    setActiveSrc(src || DEFAULT_MARKET_IMAGE);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="market-hero__image"
      src={activeSrc}
      alt={alt}
      onError={() => setActiveSrc(DEFAULT_MARKET_IMAGE)}
    />
  );
}
