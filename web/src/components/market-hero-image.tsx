"use client";

import { useEffect, useState } from "react";

import { PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";
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
      onError={() => {
        if (activeSrc !== PLEASE_MARKET_LOGO_SRC) {
          setActiveSrc(PLEASE_MARKET_LOGO_SRC);
        }
      }}
    />
  );
}
