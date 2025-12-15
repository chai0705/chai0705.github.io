/**
 * MobilePostHeader Component
 *
 * Mobile-only header for post pages that shows current heading title
 * with progress circle and expandable TOC dropdown.
 */

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback } from 'react';
import { animation } from '@constants/design-tokens';
import {
  useMediaQuery,
  useHeadingTree,
  useActiveHeading,
  useExpandedState,
  findHeadingById,
  getParentIds,
  getSiblingIds,
} from '@hooks/index';
import { useCurrentHeading } from '@hooks/useCurrentHeading';
import { HeadingTitle } from './HeadingTitle';
import { ProgressCircle } from './ProgressCircle';
import { MobileTOCDropdown } from './MobileTOCDropdown';
import { seoConfig, siteConfig } from '@/constants/site-config';

interface MobilePostHeaderProps {
  /** Whether the current page is a post page */
  isPostPage: boolean;
  /** Type of logo element to display */
  logoElement: 'svg' | 'text';
  /** Text to display when logoElement is 'text' */
  logoText?: string;
  /** Logo image URL (for svg type) */
  logoSrc?: string;
}

// Scroll offset for detecting active heading
const SCROLL_OFFSET_TOP = 80;

export function MobilePostHeader({ isPostPage, logoElement, logoText, logoSrc }: MobilePostHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  // Check if we're on mobile (tablet breakpoint: max-width 992px)
  const isMobile = useMediaQuery('(max-width: 992px)');

  // Get current H2/H3 heading for title display
  const currentHeading = useCurrentHeading({ offsetTop: SCROLL_OFFSET_TOP });

  // Get full heading tree for TOC dropdown
  const headings = useHeadingTree();

  // Get active heading ID for TOC highlighting
  const activeId = useActiveHeading({ offsetTop: SCROLL_OFFSET_TOP + 40 });

  // Get expanded state for TOC accordion
  const { expandedIds, setExpandedIds } = useExpandedState({
    headings,
    activeId,
    defaultExpanded: false,
  });

  // Determine if we should show heading mode
  const showHeadingMode = isPostPage && isMobile && headings.length > 0 && currentHeading !== null;

  // Handle heading click in TOC dropdown
  const handleHeadingClick = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;

      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Trigger expand logic for this heading
      const clickedHeading = findHeadingById(headings, id);
      if (!clickedHeading) return;

      const parentIds = getParentIds(clickedHeading);
      if (clickedHeading.children.length > 0) {
        parentIds.unshift(id);
      }

      if (parentIds.length === 0) return;

      setExpandedIds((prev) => {
        const newSet = new Set(prev);

        const parentsByLevel: { [level: number]: string[] } = {};

        parentIds.forEach((parentId) => {
          const parentHeading = findHeadingById(headings, parentId);
          if (parentHeading) {
            if (!parentsByLevel[parentHeading.level]) {
              parentsByLevel[parentHeading.level] = [];
            }
            parentsByLevel[parentHeading.level].push(parentId);
          }
        });

        Object.keys(parentsByLevel).forEach((levelStr) => {
          const level = parseInt(levelStr, 10);
          const parentsAtLevel = parentsByLevel[level];

          parentsAtLevel.forEach((parentId) => {
            const parentHeading = findHeadingById(headings, parentId);
            if (parentHeading) {
              const siblingIds = getSiblingIds(parentHeading, headings);
              siblingIds.forEach((siblingId) => newSet.delete(siblingId));
              newSet.add(parentId);
            }
          });
        });

        return newSet;
      });
    },
    [headings, setExpandedIds],
  );

  // Logo component
  const Logo = () => (
    <a href="/" className="flex items-center gap-1 text-sm font-bold whitespace-nowrap">
      {logoElement === 'svg' && logoSrc ? (
        <img src={logoSrc} alt={siteConfig?.alternate ?? siteConfig?.name} className="h-8" />
      ) : (
        <span className="logo-text text-primary text-2xl font-light tracking-widest capitalize">{logoText}</span>
      )}
    </a>
  );

  // If not mobile or not a post page, always show logo
  if (!isMobile) {
    return <Logo />;
  }

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {showHeadingMode ? (
          <motion.div
            key="heading-mode"
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : animation.spring.gentle}
          >
            <MobileTOCDropdown
              headings={headings}
              activeId={activeId}
              expandedIds={expandedIds}
              onHeadingClick={handleHeadingClick}
              trigger={
                <button
                  className="bg-foreground/10 hover:bg-foreground/20 flex w-[calc(100vw-10.5rem)] items-center gap-2.5 rounded-full py-1 pr-3 pl-1.5 backdrop-blur-sm transition-colors"
                  aria-label="展开目录"
                >
                  {/* Progress circle - fixed size container */}
                  <div className="relative shrink-0">
                    <ProgressCircle size={32} strokeWidth={2.5} />
                  </div>
                  <div className="overflow-hidden">
                    <HeadingTitle heading={currentHeading} />
                  </div>
                </button>
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="logo-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : animation.spring.gentle}
          >
            <Logo />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
