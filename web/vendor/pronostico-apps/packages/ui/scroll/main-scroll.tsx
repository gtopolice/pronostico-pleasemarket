"use client";

import React from "react";
import { HorizontalScroll } from "./horizontal-scroll";
import { VerticalScroll } from "./vertical-scroll";

export interface MainScrollProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  height?: string | number;
  className?: string;
  gap?: number;
  direction?: "horizontal" | "vertical";
  endItem?: React.ReactNode;
  topComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  columns?: number | {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  scrollContainerClassName?: string;
  itemsContainerClassName?: string;
  useVirtualization?: boolean;
  useWindowScroll?: boolean;
  overscan?: number;
  headerGap?: number;
}

export function MainScroll({
  items,
  autoPlay = false,
  autoPlayInterval = 3000,
  showControls = true,
  showIndicators = true,
  className = "",
  gap = 24,
  direction = "horizontal",
  endItem,
  topComponent,
  emptyComponent,
  columns,
  scrollContainerClassName,
  itemsContainerClassName,
  useVirtualization,
  useWindowScroll,
  overscan,
  headerGap,
}: MainScrollProps) {
  if (direction === "horizontal") {
    return (
      <HorizontalScroll
        items={items}
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
        showControls={showControls}
        showIndicators={showIndicators}
        className={className}
        gap={gap}
        emptyComponent={emptyComponent}
      />
    );
  }

  return (
    <VerticalScroll
      items={items}
      autoPlay={autoPlay}
      autoPlayInterval={autoPlayInterval}
      showControls={showControls}
      showIndicators={showIndicators}
      className={className}
      gap={gap}
      endItem={endItem}
      topComponent={topComponent}
      emptyComponent={emptyComponent}
      columns={columns}
      scrollContainerClassName={scrollContainerClassName}
      itemsContainerClassName={itemsContainerClassName}
      useVirtualization={useVirtualization}
      useWindowScroll={useWindowScroll}
      overscan={overscan}
      headerGap={headerGap}
    />
  );
}
