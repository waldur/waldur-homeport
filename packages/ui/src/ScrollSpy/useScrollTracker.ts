import { useEffect, useRef, useState } from 'react';

import { resolveContainer, ScrollContainer } from './scrollToSection';

export type ScrollTrackSide = 'top' | 'bottom' | 'area';

export interface UseScrollTrackerOptions {
  /** Array of element IDs to track in the document or container */
  sectionIds: string[];
  /**
   * Strategy to determine which section is currently active:
   * - 'area': Section with the largest visible intersection ratio in the tracking zone.
   * - 'top': First section visible past the top threshold.
   * - 'bottom': Section visible past the bottom threshold.
   * @default 'area'
   */
  trackSide?: ScrollTrackSide;
  /**
   * Offset in pixels shrunk from the relevant viewport edge(s).
   * Maps directly to `rootMargin` on the IntersectionObserver.
   * @default 100
   */
  offset?: number;

  /**
   * Optional custom scrollable container element, ref, getter function, or selector.
   * Defaults to window (viewport).
   */
  container?: ScrollContainer;
  /**
   * Whether scroll tracking is currently active.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Tracks which section from `sectionIds` is currently most visible as the user scrolls.
 *
 * Uses `IntersectionObserver` for zero-reflow, browser-native tracking.
 * No scroll/click/resize listeners are attached — all geometry is handled by the platform.
 *
 * @param options - Configuration options.
 * @returns The active section ID, or null when no tracked section is visible.
 */
export const useScrollTracker = ({
  sectionIds,
  trackSide = 'area',
  offset = 100,
  container,
  enabled = true,
}: UseScrollTrackerOptions): string | null => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Tracks the latest intersection ratio per section ID.
  // Kept in a ref so the IO callback always reads current values without
  // being recreated when ratios change.
  const ratiosRef = useRef<Record<string, number>>({});

  // Stable ref to sectionIds so the pickActive closure doesn't capture a stale array.
  const sectionIdsRef = useRef(sectionIds);
  sectionIdsRef.current = sectionIds;

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled || !sectionIds.length) {
      setActiveSection(null);
      return;
    }

    const containerEl = resolveContainer(container);
    // IO `root` must be an Element or null (null = viewport).
    const root = containerEl instanceof HTMLElement ? containerEl : null;

    // rootMargin shrinks the intersection zone by `offset` from the relevant edge(s).
    // Negative values inset the root rectangle, so only the zone within the margins
    // counts as "visible" for intersection purposes.
    const rootMargin =
      trackSide === 'top'
        ? `-${offset}px 0px -50% 0px`
        : trackSide === 'bottom'
          ? `-50% 0px -${offset}px 0px`
          : `-${offset}px 0px -${offset}px 0px`;

    // 21 evenly-spaced thresholds (0, 0.05, … 1.0) for smooth ratio resolution.
    const threshold = Array.from({ length: 21 }, (_, i) => i / 20);

    const pickActive = () => {
      let bestId: string | null = null;
      let bestRatio = 0;
      // Iterate in declaration order so ties go to the topmost section.
      for (const id of sectionIdsRef.current) {
        const ratio = ratiosRef.current[id] ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      }
      setActiveSection(bestId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratiosRef.current[entry.target.id] = entry.intersectionRatio;
        });
        pickActive();
      },
      { root, rootMargin, threshold },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds, trackSide, offset, container, enabled]);

  return activeSection;
};
