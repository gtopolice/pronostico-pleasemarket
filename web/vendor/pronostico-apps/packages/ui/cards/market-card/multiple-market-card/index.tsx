"use client";

import { CardWrapper } from "../card-wrapper";
import { MultipleSelection } from "./selection";
import {
  MarketCardProps,
  MarketCardType,
  MultiSelectOptions,
} from "../types/interfaces";
import { Footer, Header } from "../shared";

export function MultipleMarketCard(props: MarketCardProps) {
  const { multiSelectOptions } = props;

  return (
    <CardWrapper onClick={() => props.onClick?.(props.id)}>
      <Header {...props} />
      <div className="w-full flex flex-col items-center justify-between gap-1 mt-[-10px]">
        {multiSelectOptions?.map((option) => (
          <MultipleSelection key={option.label} option={option} />
        ))}
      </div>
      <Footer {...props} />
    </CardWrapper>
  );
}

// Re-export types for convenience
export type { MarketCardType, MultiSelectOptions, MarketCardProps };
