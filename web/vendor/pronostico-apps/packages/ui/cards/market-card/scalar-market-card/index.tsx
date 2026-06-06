"use client";

import { ScalarSelection } from "./selection";
import { Footer } from "../shared";
import { MarketCardProps } from "../types/interfaces";
import { Skeleton } from "@mui/material";
import { useImageRetry } from "../../../hooks/use-image-retry";
import React from "react";

function TeamLogo({ src, alt }: { src?: string; alt?: string }) {
  const { imgSrc, handleError } = useImageRetry(src, "/favicon.png", 1);
  return (
    <img
      src={imgSrc}
      alt={alt}
      style={{ width: 30 }}
      onError={handleError}
    />
  );
}

export function ScalarMarketCard(props: MarketCardProps) {
  const { isLoading } = props;
  return (
    <>
      <div className="w-full flex flex-col items-center justify-between gap-2">
        {/*Header*/}
        {props?.teams?.map((team) => (
          <div
            key={team.name}
            className="w-full flex flex-row items-center justify-between"
          >
            <div className="flex flex-row items-center gap-2">
              {isLoading ? (
                <div>
                  <Skeleton className="rounded-[8px]" width={25} height={35} />
                </div>
              ) : (
                <TeamLogo
                  src={team.logo}
                  alt={team.name}
                />
              )}

              <span className="text-[var(--predictions-card-title)] text-[14px] leading-[20px] tracking-[0.1px] font-[500]">
                {team.name}
              </span>
            </div>
            <span className="text-[var(--predictions-card-title)] text-[14px] leading-[20px] tracking-[0.1px] font-[700]">
              {team.marketPercentage}%
            </span>
          </div>
        ))}
      </div>

      {/* Selection */}
      <ScalarSelection isLoading={isLoading} teams={props?.teams} />

      {/*Footer*/}
      <Footer {...props} />
    </>
  );
}
