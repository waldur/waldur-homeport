import { getInitialValues } from '@/core/filters';
import { type RootState } from '@/store/reducers';

import { MarketplaceFilterItem } from '../types';

export const getMarketplaceFilters = (state: RootState) =>
  state.marketplace.filters.filtersStorage;

export const getContextFiltersForOfferings = (
  filters: MarketplaceFilterItem[],
) => {
  const contextFilter = {};
  if (filters.length) {
    const customerFilter = filters.find((item) => item.name === 'organization');
    if (customerFilter) {
      Object.assign(contextFilter, {
        allowed_customer_uuid: customerFilter.value?.uuid,
      });
      const projectFilter = filters.find((item) => item.name === 'project');
      if (projectFilter) {
        Object.assign(contextFilter, {
          project_uuid: projectFilter.value?.uuid,
        });
      }
    }
    const tagFilter = filters.find((item) => item.name === 'tag');
    if (tagFilter) {
      Object.assign(contextFilter, { tag: tagFilter.value?.uuid });
    }
  } else {
    // If filter is empty, check url to see if there is any filter
    // Because when start time, the filters that are in the URL should be applied immediately (to reduce the requests).
    const urlFilters = getInitialValues();
    if (urlFilters?.organization) {
      Object.assign(contextFilter, {
        allowed_customer_uuid: urlFilters.organization?.uuid,
      });
      if (urlFilters?.project) {
        Object.assign(contextFilter, {
          project_uuid: urlFilters.project?.uuid,
        });
      }
    }
    if (urlFilters?.tag) {
      Object.assign(contextFilter, { tag: urlFilters.tag?.uuid });
    }
  }
  return Object.keys(contextFilter).length > 0 ? contextFilter : null;
};
