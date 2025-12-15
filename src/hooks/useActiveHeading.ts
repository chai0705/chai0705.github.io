/**
 * useActiveHeading Hook
 *
 * Tracks the currently active heading based on scroll position.
 * Uses useSyncExternalStore to avoid unnecessary re-renders.
 *
 * @example
 * ```tsx
 * function TableOfContents() {
 *   const activeId = useActiveHeading({ offsetTop: 120 });
 *
 *   return (
 *     <nav>
 *       {headings.map(heading => (
 *         <a
 *           key={heading.id}
 *           className={activeId === heading.id ? 'active' : ''}
 *         >
 *           {heading.text}
 *         </a>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */

import { useMemo, useSyncExternalStore } from 'react';

export interface UseActiveHeadingOptions {
  /** Offset from top of viewport for detecting active heading (default: 120px for header) */
  offsetTop?: number;
  /** Throttle delay for scroll event (ms) */
  throttleDelay?: number;
}

/**
 * Creates a scroll store for tracking active heading ID
 * Uses the external store pattern to minimize re-renders
 */
function createActiveHeadingStore(offsetTop: number, throttleDelay: number) {
  let activeId = '';
  let listeners = new Set<() => void>();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Calculate active heading based on scroll position
  const calculateActiveHeading = () => {
    const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    let newActiveId = '';
    for (const heading of headingElements) {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= offsetTop) {
        newActiveId = heading.id;
      } else {
        break;
      }
    }

    // Only notify listeners if activeId changed
    if (activeId !== newActiveId) {
      activeId = newActiveId;
      listeners.forEach((listener) => listener());
    }
  };

  // Throttled scroll handler
  const handleScroll = () => {
    if (timeoutId) return;

    timeoutId = setTimeout(() => {
      calculateActiveHeading();
      timeoutId = null;
    }, throttleDelay);
  };

  // Handle Astro page transitions
  const handlePageLoad = () => {
    // Reset and recalculate on page navigation
    activeId = '';
    calculateActiveHeading();
  };

  return {
    subscribe: (listener: () => void) => {
      // First listener - set up event listeners
      if (listeners.size === 0) {
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('astro:page-load', handlePageLoad);

        // Initial calculation
        calculateActiveHeading();
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

    getSnapshot: () => activeId,

    // For SSR - return empty string
    getServerSnapshot: () => '',
  };
}

/**
 * Hook to track the currently active heading based on scroll position
 * Uses useSyncExternalStore for optimal performance - only re-renders when activeId changes
 *
 * @param options - Active heading options
 * @returns ID of the currently active heading
 */
export function useActiveHeading({ offsetTop = 120, throttleDelay = 100 }: UseActiveHeadingOptions = {}): string {
  // Memoize store creation to avoid recreating on every render
  const store = useMemo(() => createActiveHeadingStore(offsetTop, throttleDelay), [offsetTop, throttleDelay]);

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
