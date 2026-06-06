"use client";

import React, { useEffect, useRef } from "react";

interface FlatListProps<T> {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor?: (item: T, index: number) => string | number;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    onItemVisible?: (item: T, index: number) => void;
    itemVisibilityThreshold?: number;
    ListEmptyComponent?: React.ReactNode;
    ListFooterComponent?: React.ReactNode;
    className?: string;
    containerStyle?: React.CSSProperties;
    noScrollbar?: boolean;
}

/**
 * A generic list component similar to React Native's FlatList.
 * Supports infinite scrolling and item visibility detection via IntersectionObserver.
 */
export function FlatList<T>({
    data,
    renderItem,
    keyExtractor,
    onEndReached,
    onEndReachedThreshold = 0.1,
    onItemVisible,
    itemVisibilityThreshold = 0.5,
    ListEmptyComponent,
    ListFooterComponent,
    className = "",
    containerStyle = {},
    noScrollbar = false,
}: FlatListProps<T>) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!onEndReached || data.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onEndReached();
                }
            },
            {
                root: containerRef.current,
                threshold: onEndReachedThreshold,
            }
        );

        const currentSentinel = sentinelRef.current;
        if (currentSentinel) {
            observer.observe(currentSentinel);
        }

        return () => {
            if (currentSentinel) {
                observer.unobserve(currentSentinel);
            }
            observer.disconnect();
        };
    }, [onEndReached, onEndReachedThreshold, data.length]);

    if (data.length === 0 && ListEmptyComponent) {
        return <div className={className}>{ListEmptyComponent}</div>;
    }

    const scrollbarClass = noScrollbar ? "no-scrollbar" : "";
    const combinedStyle: React.CSSProperties = {
        ...containerStyle,
        ...(noScrollbar ? { msOverflowStyle: "none", scrollbarWidth: "none" } : {}),
    };

    return (
        <div
            ref={containerRef}
            className={`flex flex-col w-full overflow-y-auto ${scrollbarClass} ${className}`}
            style={combinedStyle}
        >
            {data.map((item, index) => (
                <FlatListItem
                    key={keyExtractor ? keyExtractor(item, index) : index}
                    item={item}
                    index={index}
                    onVisible={onItemVisible}
                    threshold={itemVisibilityThreshold}
                    root={containerRef.current}
                >
                    {renderItem(item, index)}
                </FlatListItem>
            ))}

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} style={{ height: "10px", width: "100%", flexShrink: 0 }} />

            {ListFooterComponent && (
                <div className="w-full flex-shrink-0">
                    {ListFooterComponent}
                </div>
            )}
        </div>
    );
}

interface FlatListItemProps<T> {
    item: T;
    index: number;
    children: React.ReactNode;
    onVisible?: (item: T, index: number) => void;
    threshold: number;
    root: HTMLDivElement | null;
}

function FlatListItem<T>({ item, index, children, onVisible, threshold, root }: FlatListItemProps<T>) {
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!onVisible) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onVisible(item, index);
                }
            },
            {
                root: root,
                threshold: threshold,
            }
        );

        const currentItem = itemRef.current;
        if (currentItem) {
            observer.observe(currentItem);
        }

        return () => {
            if (currentItem) {
                observer.unobserve(currentItem);
            }
            observer.disconnect();
        };
    }, [onVisible, item, index, threshold, root]);

    return <div ref={itemRef} className="w-full flex-shrink-0">{children}</div>;
}
