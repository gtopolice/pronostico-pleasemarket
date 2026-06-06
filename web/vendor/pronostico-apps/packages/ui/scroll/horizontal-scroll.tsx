"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import ScrollContainer from "react-indiana-drag-scroll";

export interface HorizontalScrollProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  gap?: number;
  emptyComponent?: React.ReactNode;
}

export function HorizontalScroll({
  items,
  autoPlay = false,
  autoPlayInterval = 3000,
  showControls = true,
  showIndicators = true,
  className = "",
  gap = 24,
  emptyComponent,
}: HorizontalScrollProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Check if scrolling is needed and update button states
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current || !itemsContainerRef.current) return;

    const container = scrollContainerRef.current;
    const itemsContainer = itemsContainerRef.current;

    const hasScroll = itemsContainer.scrollWidth > container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const maxScroll = itemsContainer.scrollWidth - container.clientWidth;

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < maxScroll - 1);

    if (!hasScroll) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }

    // Update current index based on scroll position
    if (items.length > 0) {
      const itemWidth = itemsContainer.scrollWidth / items.length;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(Math.min(index, items.length - 1));
    }
  };

  useEffect(() => {
    updateScrollButtons();

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollButtons();
    };

    const handleWheel = (e: WheelEvent) => {
      const isHorizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const scrollAmount = isHorizontalIntent ? e.deltaX : e.deltaY;

      if (scrollAmount !== 0) {
        container.scrollLeft += scrollAmount;
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    container.addEventListener("wheel", handleWheel as any, { passive: false });

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      updateScrollButtons();
    });

    resizeObserver.observe(container);
    if (itemsContainerRef.current) {
      resizeObserver.observe(itemsContainerRef.current);
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel as any);
      resizeObserver.disconnect();
    };
  }, [items]);

  const scroll = (scrollDirection: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;

    container.scrollTo({
      left:
        scrollDirection === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current || !itemsContainerRef.current) return;

    const container = scrollContainerRef.current;
    const itemsContainer = itemsContainerRef.current;
    const itemWidth = itemsContainer.scrollWidth / items.length;

    container.scrollTo({
      left: itemWidth * index,
      behavior: "smooth",
    });
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || items.length <= 1 || !canScrollRight) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current || !itemsContainerRef.current) return;

      const container = scrollContainerRef.current;
      const itemsContainer = itemsContainerRef.current;
      const maxScroll = itemsContainer.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("right");
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, items.length, canScrollRight]);

  if (items.length === 0) {
    return emptyComponent;
  }

  const showNavigationControls =
    showControls && (canScrollLeft || canScrollRight);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
      }}
      className={className}
    >
      {/* Scrollable Container with drag-to-scroll */}
      <ScrollContainer
        innerRef={scrollContainerRef}
        horizontal={true}
        vertical={false}
        hideScrollbars={true}
        activationDistance={10}
        ignoreElements="a, input"
        nativeMobileScroll={true}
        className="custom-scroll-container custom-scroll-horizontal"
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        {/* Items Container */}
        <Box
          ref={itemsContainerRef}
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "max-content",
            gap: `${gap}px`,
          }}
        >
          {items.map((item, index) => (
            <Box
              key={index}
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item}
            </Box>
          ))}
        </Box>
      </ScrollContainer>

      {/* Navigation Controls */}
      {showNavigationControls && (
        <>
          {canScrollLeft && (
            <IconButton
              onClick={() => scroll("left")}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                "&:hover": {
                  backgroundColor: "var(--color-surface-container)",
                },
                zIndex: 2,
              }}
              aria-label="Scroll left"
            >
              <ChevronLeft />
            </IconButton>
          )}
          {canScrollRight && (
            <IconButton
              onClick={() => scroll("right")}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": {
                  backgroundColor: "var(--color-surface-container)",
                },
                zIndex: 2,
              }}
              aria-label="Scroll right"
            >
              <ChevronRight />
            </IconButton>
          )}
        </>
      )}

      {/* Indicators */}
      {showIndicators &&
        items.length > 1 &&
        (canScrollLeft || canScrollRight) && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "row",
              gap: 1,
              zIndex: 2,
            }}
          >
            {items.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  width: currentIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: 1,
                  backgroundColor:
                    currentIndex === index
                      ? "var(--color-primary)"
                      : "var(--color-secondary)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  opacity: currentIndex === index ? 1 : 0.5,
                  "&:hover": {
                    opacity: 1,
                  },
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </Box>
        )}
    </Box>
  );
}
