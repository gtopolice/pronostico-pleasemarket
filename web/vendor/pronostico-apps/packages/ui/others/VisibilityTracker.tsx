"use client";

import React, { useEffect, useRef } from "react";

interface VisibilityTrackerProps {
    onVisible: () => void;
    children: React.ReactNode;
    threshold?: number;
    once?: boolean;
}

export const VisibilityTracker = React.memo(function VisibilityTracker({
    onVisible,
    children,
    threshold = 0.5,
    once = true,
}: VisibilityTrackerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onVisibleRef = useRef(onVisible);

    useEffect(() => {
        onVisibleRef.current = onVisible;
    }, [onVisible]);

    useEffect(() => {
        const currentRef = containerRef.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onVisibleRef.current();
                    if (once) {
                        observer.unobserve(currentRef);
                    }
                }
            },
            { threshold }
        );

        observer.observe(currentRef);

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
            observer.disconnect();
        };
    }, [threshold, once]);

    return <div className="w-full h-full" ref={containerRef}>{children}</div>;
});
