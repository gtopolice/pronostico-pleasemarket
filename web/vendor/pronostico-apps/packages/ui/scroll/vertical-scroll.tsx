"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import { VirtuosoGrid } from "react-virtuoso";

export interface VerticalScrollProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  gap?: number;
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
  onScroll?: (y: number) => void;
}

// ─── Stable VirtuosoGrid Component Definitions ───────────────────────────
// CRITICAL: These MUST be defined outside the component function.
// react-virtuoso docs: "Ensure that this stays out of the component,
// Otherwise the grid will remount with each render due to new component instances."

interface ScrollContextValue {
  topComponent?: React.ReactNode;
  endItem?: React.ReactNode;
  gap: number;
  headerGap: number;
  columns?: VerticalScrollProps["columns"];
  itemsContainerClassName?: string;
}

const ScrollContext = React.createContext<ScrollContextValue>({ gap: 24, headerGap: 0 });

const VirtuosoHeader = () => {
  const { topComponent, headerGap } = React.useContext(ScrollContext);
  return (
    <>
      {topComponent}
      <div style={{ height: topComponent ? headerGap : 0 }} />
    </>
  );
};

const VirtuosoFooter = () => {
  const { endItem } = React.useContext(ScrollContext);
  return (
    <>
      {endItem}
    </>
  );
};

// The List container: ONLY display:flex + flexWrap:wrap. NO gap!
// Virtuoso uses paddingTop/paddingBottom on this element to compensate for
// virtualized items. CSS `gap` is NOT included in Virtuoso's padding
// calculations, causing accumulated offset errors that manifest as "jumps".
const VirtuosoList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, children, ...props }, ref) => {
    const { itemsContainerClassName } = React.useContext(ScrollContext);
    return (
      <div
        ref={ref}
        {...props}
        className={itemsContainerClassName || undefined}
        style={{
          display: "flex",
          flexWrap: "wrap",
          ...style, // CRITICAL: spread Virtuoso's style LAST so paddingTop/paddingBottom are preserved
        }}
      >
        {children}
      </div>
    );
  }
);
VirtuosoList.displayName = "VirtuosoList";

// The Item wrapper: uses padding for spacing (not gap on parent).
// `flex: "none"` and `boxSizing: "border-box"` per official docs.
const VirtuosoItem = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { columns, gap } = React.useContext(ScrollContext);
  const halfGap = gap / 2;

  const widthStyle: React.CSSProperties = React.useMemo(() => {
    if (!columns) return { width: "100%" };
    if (typeof columns === "number") {
      return { width: `${100 / columns}%` };
    }
    // For responsive columns, use the largest breakpoint as default
    // MUI sx won't work on a plain div, so we use the lg or last defined value
    const col = columns.lg || columns.md || columns.sm || columns.xs || 1;
    return { width: `${100 / col}%` };
  }, [columns]);

  return (
    <div
      {...props}
      style={{
        ...widthStyle,
        padding: `${halfGap}px`,
        display: "flex",
        flex: "none",
        alignContent: "stretch",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
};

const VirtuosoPlaceholder = () => <div style={{ height: 452, width: "100%" }} />;

const virtuosoComponents = {
  Header: VirtuosoHeader,
  Footer: VirtuosoFooter,
  List: VirtuosoList as any,
  Item: VirtuosoItem,
  ScrollSeekPlaceholder: VirtuosoPlaceholder,
};

// ─── End VirtuosoGrid Component Definitions ──────────────────────────────

export function VerticalScroll({
  items,
  autoPlay = false,
  autoPlayInterval = 3000,
  showControls = true,
  showIndicators = true,
  className = "",
  gap = 24,
  endItem,
  topComponent,
  emptyComponent,
  columns,
  scrollContainerClassName,
  itemsContainerClassName,
  useVirtualization = false,
  useWindowScroll = false,
  overscan = 12,
  headerGap = 0,
  onScroll,
}: VerticalScrollProps) {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxHeight, setMaxHeight] = useState<string | number | undefined>(
    undefined
  );
  const [itemsPerRow, setItemsPerRow] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const displayItems = endItem ? [...items, endItem] : items;

  // Calculate how many columns can fit based on container width
  const calculateItemsPerRow = () => {
    if (!scrollContainerRef.current) return 1;

    const container = scrollContainerRef.current;
    const containerWidth = container.clientWidth;

    const minCardWidth = 280;
    const maxCardWidth = 318;

    const maxColumns = Math.floor(
      (containerWidth + gap) / (minCardWidth + gap)
    );

    const minColumns = Math.floor(
      (containerWidth + gap) / (maxCardWidth + gap)
    );

    return Math.max(1, Math.max(minColumns, maxColumns));
  };

  const measureActualItemsPerRow = () => {
    if (!itemsContainerRef.current) return 1;

    const container = itemsContainerRef.current;
    const children = Array.from(container.children) as HTMLElement[];

    if (children.length === 0) return 1;

    const firstItem = children[0];
    if (!firstItem) return 1;

    const firstItemTop = firstItem.offsetTop;
    let itemsInFirstRow = 1;

    for (let i = 1; i < children.length; i++) {
      const itemTop = children[i].offsetTop;
      if (Math.abs(itemTop - firstItemTop) < 10) {
        itemsInFirstRow++;
      } else {
        break;
      }
    }

    return itemsInFirstRow;
  };

  useEffect(() => {
    const updateLayout = () => {
      const calculatedPerRow = calculateItemsPerRow();
      const measuredPerRow = measureActualItemsPerRow();
      const finalPerRow = measuredPerRow > 0 ? measuredPerRow : calculatedPerRow;

      if (finalPerRow > 0 && finalPerRow !== itemsPerRow) {
        setItemsPerRow(finalPerRow);
        setTotalRows(Math.ceil(items.length / finalPerRow));
      }
    };

    updateLayout();

    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });

    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }
    if (itemsContainerRef.current) {
      resizeObserver.observe(itemsContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [items.length, gap]);

  useEffect(() => {
    const calculateMaxHeight = () => {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const availableHeight = viewportHeight - rect.top;

      if (availableHeight > 0) {
        // Round to nearest integer to avoid sub-pixel layout shifts triggering resize observers
        const roundedHeight = Math.floor(availableHeight);
        setMaxHeight(`${roundedHeight}px`);
      }
    };

    // Initial delay to allow layout to settle
    setTimeout(calculateMaxHeight, 100);
    window.addEventListener("resize", calculateMaxHeight);

    return () => {
      window.removeEventListener("resize", calculateMaxHeight);
    };
  }, []);

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current || !itemsContainerRef.current) return;

    const container = scrollContainerRef.current;
    const itemsContainer = itemsContainerRef.current;

    const hasScroll = itemsContainer.scrollHeight > container.clientHeight;
    const scrollTop = container.scrollTop;
    const maxScroll = itemsContainer.scrollHeight - container.clientHeight;

    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop < maxScroll - 1);

    if (onScroll) {
      onScroll(scrollTop);
    }

    if (!hasScroll) {
      setCanScrollUp(false);
      setCanScrollDown(false);
    }

    if (items.length > 0 && itemsPerRow > 0) {
      const calculatedTotalRows = Math.ceil(items.length / itemsPerRow);
      setTotalRows(calculatedTotalRows);

      if (calculatedTotalRows > 0) {
        const rowHeight = itemsContainer.scrollHeight / calculatedTotalRows;
        const currentRow = Math.round(scrollTop / rowHeight);
        setCurrentIndex(Math.min(currentRow, calculatedTotalRows - 1));
      }
    }
  };

  useEffect(() => {
    updateScrollButtons();

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // First, immediately dispatch the scroll value to listeners for 60fps animations
      const scrollTop = container.scrollTop;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mainScroll", { detail: { scrollTop } }));
      }

      updateScrollButtons();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollButtons();
    });

    resizeObserver.observe(container);
    if (itemsContainerRef.current) {
      resizeObserver.observe(itemsContainerRef.current);
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [items, itemsPerRow]);

  const scroll = (scrollDirection: "up" | "down") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientHeight * 0.8;

    container.scrollTo({
      top:
        scrollDirection === "up"
          ? container.scrollTop - scrollAmount
          : container.scrollTop + scrollAmount,
      behavior: "smooth",
    });
  };

  const goToSlide = (rowIndex: number) => {
    if (!scrollContainerRef.current || !itemsContainerRef.current) return;

    const container = scrollContainerRef.current;
    const itemsContainer = itemsContainerRef.current;
    const calculatedTotalRows = Math.ceil(items.length / itemsPerRow);

    if (calculatedTotalRows > 0) {
      const rowHeight = itemsContainer.scrollHeight / calculatedTotalRows;
      container.scrollTo({
        top: rowHeight * rowIndex,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (!autoPlay || items.length <= 1 || !canScrollDown) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current || !itemsContainerRef.current) return;

      const container = scrollContainerRef.current;
      const itemsContainer = itemsContainerRef.current;
      const maxScroll = itemsContainer.scrollHeight - container.clientHeight;

      if (container.scrollTop >= maxScroll - 10) {
        container.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        scroll("down");
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, items.length, canScrollDown]);



  if (items.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: topComponent ? 3 : 0,
        }}
        className={className}
      >
        {topComponent}
        {emptyComponent}
      </Box>
    );
  }

  const showNavigationControls = showControls && (canScrollUp || canScrollDown);

  if (useVirtualization) {
    return (
      <Box
        ref={wrapperRef}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: useWindowScroll ? "visible" : "hidden",
          ...(maxHeight && !useWindowScroll
            ? {
              maxHeight,
              height: maxHeight,
            }
            : {}),
          "& [data-virtuoso-scroller='true']": {
            width: "100%",
            maxWidth: "100%",
            flex: 1,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
        }}
        className={className}
      >
        <ScrollContext.Provider value={{ topComponent, endItem, gap, headerGap, columns, itemsContainerClassName }}>
          <VirtuosoGrid
            data={items}
            computeItemKey={(index, item) => {
              if (React.isValidElement(item) && item.key !== null) {
                return item.key;
              }
              return index;
            }}
            overscan={overscan}
            useWindowScroll={useWindowScroll}
            onScroll={(e) => {
              const scrollTop = (e.target as HTMLElement).scrollTop;
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("mainScroll", { detail: { scrollTop } }));
              }
              if (onScroll) onScroll(scrollTop);
            }}
            style={{
              height: useWindowScroll ? "auto" : "100%",
              width: "100%",
            }}
            className={scrollContainerClassName}
            components={virtuosoComponents}
            itemContent={(index, item) => item}
          />
        </ScrollContext.Provider>
      </Box>
    );
  }

  return (
    <Box
      ref={wrapperRef}
      sx={{
        position: "relative",
        width: "100%",
      }}
      className={className}
    >
      {topComponent && (
        <>
          {topComponent}
          <div style={{ height: headerGap }} />
        </>
      )}

      <Box
        ref={itemsContainerRef}
        className={itemsContainerClassName}
        sx={{
          display: columns ? "grid" : "flex",
          ...(columns
            ? {
              gridTemplateColumns:
                typeof columns === "number"
                  ? `repeat(${columns}, minmax(0, 424px))`
                  : columns && typeof columns === "object"
                    ? Object.entries(columns as Record<string, number>).reduce((acc, [key, val]) => ({
                      ...acc,
                      [key]: `repeat(${val}, minmax(0, 424px))`
                    }), {})
                    : undefined,
              justifyContent: "space-between",
            }
            : {
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "flex-start",
            }),
          width: "100%",
          gap: `${gap}px`,
          alignItems: "flex-start",
        }}
      >
        {displayItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              flex: columns ? "1 1 0" : "0 0 auto",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: columns ? "100%" : { xs: "100%", sm: "auto" },
              minWidth: 0,
            }}
          >
            {item}
          </Box>
        ))}
      </Box>

      {showNavigationControls && (
        <>
          {canScrollUp && (
            <IconButton
              onClick={() => scroll("up")}
              sx={{
                position: "absolute",
                top: 8,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                "&:hover": {
                  backgroundColor: "var(--color-surface-container)",
                },
                zIndex: 2,
              }}
              aria-label="Scroll up"
            >
              <KeyboardArrowUp />
            </IconButton>
          )}
          {canScrollDown && (
            <IconButton
              onClick={() => scroll("down")}
              sx={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": {
                  backgroundColor: "var(--color-surface-container)",
                },
                zIndex: 2,
              }}
              aria-label="Scroll down"
            >
              <KeyboardArrowDown />
            </IconButton>
          )}
        </>
      )}

      {showIndicators && items.length > 1 && (canScrollUp || canScrollDown) && (
        <Box
          sx={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            zIndex: 2,
          }}
        >
          {Array.from({ length: totalRows }).map((_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                width: 8,
                height: currentIndex === index ? 24 : 8,
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
              aria-label={`Go to row ${index + 1}`}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
