import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { marketplaceCategoriesList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { LONG_STALE_TIME } from '@/core/constants';

export const useOfferingCategories = () => {
  const { data: categories } = useQuery({
    queryKey: ['ResourcesMenu', 'Categories'],

    queryFn: () =>
      getAllPages((page) =>
        marketplaceCategoriesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            field: ['uuid', 'offering_count', 'group', 'icon', 'title'],
          },
        }),
      ),

    // Many sidebar/search/landing components subscribe to this hook on every page;
    // without a staleTime each mount considers the cache stale and fires its own
    // request before React Query's in-flight dedupe window closes, producing an
    // N+1 burst of identical /api/marketplace-categories/ calls (CSCS-5A8).
    refetchOnWindowFocus: false,
    staleTime: LONG_STALE_TIME,
  });
  return categories;
};

/**
 * Shared "only one sibling open at a time" state for a group of
 * MenuAccordion rows — the Radix-Collapsible replacement for Metronic's
 * `MenuComponent`'s own single-branch-open accordion coordination (see
 * MenuAccordion.tsx's own top comment for why Collapsible, not Accordion,
 * is used here). One call per group of siblings that should collapse each
 * other: the sidebar's own top level (UnifiedSidebar.tsx), and each
 * distinct nesting level inside ResourcesMenu's recursive categories.
 */
export function useExclusiveOpen(initial?: string) {
  const [openId, setOpenId] = useState<string | undefined>(initial);
  return {
    openId,
    setOpenId,
    toggle: (id: string) => (next: boolean) => setOpenId(next ? id : undefined),
  };
}
