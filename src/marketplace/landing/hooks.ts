import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { getCategories } from '@waldur/marketplace/common/api';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import {
  getContextFiltersForOfferings,
  getMarketplaceFilters,
} from './filter/store/selectors';

export function useLandingCategories() {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const marketplaceFilters = useSelector(getMarketplaceFilters);
  let contextFilter = getContextFiltersForOfferings(marketplaceFilters);
  if (!contextFilter) {
    contextFilter = {
      allowed_customer_uuid: customer?.uuid,
      project_uuid: project?.uuid,
    };
  }
  const options = {
    params: {
      ...contextFilter,
      has_offerings: true,
      field: ['uuid', 'icon', 'title', 'offering_count'],
    },
  };
  return useQuery({
    queryKey: ['landing-categories', contextFilter],
    queryFn: () => getCategories(options),
    staleTime: 5 * 60 * 1000,
  });
}
