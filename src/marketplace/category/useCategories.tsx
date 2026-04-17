import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { marketplaceCategoriesList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { SHORT_STALE_TIME } from '@waldur/core/constants';
import { getCategoryGroups } from '@waldur/marketplace/common/api';

import {
  getContextFiltersForOfferings,
  getMarketplaceFilters,
} from '../landing/filter/store/selectors';

import { getGroupedCategories } from './utils';

export const useCategories = () => {
  const marketplaceFilters = useSelector(getMarketplaceFilters);
  const contextFilter = getContextFiltersForOfferings(marketplaceFilters) || {};

  return useQuery({
    queryKey: ['useCategories', contextFilter],

    queryFn: () =>
      Promise.all([
        getCategoryGroups(),
        getAllPages((page) =>
          marketplaceCategoriesList({
            query: {
              page,
              page_size: MAX_PAGE_SIZE,
              field: ['uuid', 'icon', 'title', 'offering_count', 'group'],
              ...contextFilter,
            },
          }),
        ),
      ]).then(([categoryGroups, categories]) =>
        getGroupedCategories(categories, categoryGroups),
      ),

    staleTime: SHORT_STALE_TIME,
  });
};
