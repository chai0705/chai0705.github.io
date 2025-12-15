/**
 * useCurrentHeading Hook
 *
 * Tracks the current H2/H3 heading for the mobile post header.
 * Uses useSyncExternalStore to avoid unnecessary re-renders.
 *
 * @example
 * ```tsx
 * function MobileHeader() {
 *   const heading = useCurrentHeading({ offsetTop: 80 });
 *   return heading ? <span>{heading.text}</span> : null;
 * }
 * ```
 */

import { useMemo, useSyncExternalStore } from 'react';

export interface CurrentHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface UseCurrentHeadingOptions {
  /** Offset from top of viewport for detecting active heading (default: 80px) */
  offsetTop?: number;
  /** Throttle delay for scroll event (ms) */
  throttleDelay?: number;
}

/**
 * Creates a scroll store for tracking current heading
 * Uses the external store pattern to minimize re-renders
 */
function createHeadingStore(offsetTop: number, throttleDelay: number) {
  let currentHeading: CurrentHeading | null = null;
  let headingElements: HTMLElement[] = [];
  let listeners = new Set<() => void>();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Query heading elements from article
  const queryHeadings = () => {
    const article = document.querySelector('article');
    if (!article) {
      headingElements = [];
      updateHeading(null);
      return;
    }

    headingElements = Array.from(
      article.querySelectorAll<HTMLElement>('h2:not(.link-preview-block h2), h3:not(.link-preview-block h3)'),
    );

    // Recalculate current heading after querying
    calculateCurrentHeading();
  };

  // Calculate current heading based on scroll position
  const calculateCurrentHeading = () => {
    if (headingElements.length === 0) {
      updateHeading(null);
      return;
    }

    let newHeading: CurrentHeading | null = null;

    for (const heading of headingElements) {
      const rect = heading.getBoundingClientRect();

      if (rect.top <= offsetTop) {
        const level = parseInt(heading.tagName.substring(1), 10) as 2 | 3;
        newHeading = {
          id: heading.id,
          text: heading.textContent?.trim() || '',
          level,
        };
      } else {
        break;
      }
    }

    updateHeading(newHeading);
  };

  // Update heading and notify listeners only if changed
  const updateHeading = (newHeading: CurrentHeading | null) => {
    // Only notify if heading actually changed (compare by id)
    if (currentHeading?.id !== newHeading?.id) {
      currentHeading = newHeading;
      listeners.forEach((listener) => listener());
    }
  };

  // Throttled scroll handler
  const handleScroll = () => {
    if (timeoutId) return;

    timeoutId = setTimeout(() => {
      calculateCurrentHeading();
      timeoutId = null;
    }, throttleDelay);
  };

  // Handle Astro page transitions
  const handlePageLoad = () => {
    queryHeadings();
  };

  return {
    subscribe: (listener: () => void) => {
      // First listener - set up event listeners
      if (listeners.size === 0) {
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('astro:page-load', handlePageLoad);

        // Initial query
        if (document.readyState !== 'loading') {
          queryHeadings();
        }
      }

      listeners.add(listener);

      return () => {
        listeners.delete(listener);

        // Last listener - clean up
        if (listeners.size === 0) {
          window.removeEventListener('scroll', handleScroll);
          document.removeEventListener('astro:page-load', handlePageLoad);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        }
      };
    },

    getSnapshot: () => currentHeading,

    // For SSR - return null
    getServerSnapshot: () => null,
  };
}

/**
 * Hook to track the current H2/H3 heading based on scroll position
 * Uses useSyncExternalStore for optimal performance - only re-renders when heading changes
 *
 * @param options - Options for heading detection
 * @returns Current heading info or null if not scrolled past any heading
 */
export function useCurrentHeading({
  offsetTop = 80,
  throttleDelay = 100,
}: UseCurrentHeadingOptions = {}): CurrentHeading | null {
  // Memoize store creation to avoid recreating on every render
  const store = useMemo(() => createHeadingStore(offsetTop, throttleDelay), [offsetTop, throttleDelay]);

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
