import { useQuery } from '@tanstack/react-query';
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
