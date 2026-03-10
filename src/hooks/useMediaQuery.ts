'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query matches.
 * Verified implementation for Next.js App Router (handles hydration).
 */
export function useMediaQuery(query: string): boolean {
    // Initial state needs to be false to match server-side rendering
    const [matches, setMatches] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const media = window.matchMedia(query);

        // Update state immediately on mount
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);

        // Use modern addEventListener if available, fallback to addListener
        if (media.addEventListener) {
            media.addEventListener('change', listener);
        } else {
            media.addListener(listener);
        }

        return () => {
            if (media.removeEventListener) {
                media.removeEventListener('change', listener);
            } else {
                media.removeListener(listener);
            }
        };
    }, [query, matches]);

    // Return false during SSR/Hydration to prevent mismatch, 
    // then the actual value after mount.
    return mounted ? matches : false;
}
