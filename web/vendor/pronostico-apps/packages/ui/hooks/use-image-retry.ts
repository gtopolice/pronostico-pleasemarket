"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to handle image loading with retries and fallback
 * @param src Original image source
 * @param fallbackSrc Fallback image source if all retries fail
 * @param retryCount Number of times to retry before falling back
 * @returns { imgSrc, handleError, reset }
 */
export function useImageRetry(
    src: string | undefined | null,
    fallbackSrc: string = "/favicon.png",
    retryCount: number = 1
) {
    const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
    const [retries, setRetries] = useState(0);

    useEffect(() => {
        setImgSrc(src?.trim() || fallbackSrc);
        setRetries(0);
    }, [src, fallbackSrc]);

    const handleError = useCallback(() => {
        if (retries < retryCount && src) {
            const nextRetry = retries + 1;
            setRetries(nextRetry);

            // Append a query parameter to force a reload, handling existing query params
            const separator = src.includes("?") ? "&" : "?";
            const retryUrl = `${src}${separator}retry=${nextRetry}`;

            setImgSrc(retryUrl);
        } else {
            setImgSrc(fallbackSrc);
        }
    }, [retries, retryCount, src, fallbackSrc]);

    const reset = useCallback(() => {
        setImgSrc(src || fallbackSrc);
        setRetries(0);
    }, [src, fallbackSrc]);

    return { imgSrc, handleError, reset };
}
