import { useMemo } from 'react';

import {
  MarketplaceProjectUpdateRequestsFilter,
  selectMarketplaceProjectUpdateRequestsFilter,
} from '@/table/generated/MarketplaceProjectUpdateRequestsFilter';
import { useFilterValues } from '@/table/useFilterValues';
import { useCustomer } from '@/workspace/hooks';

import { BaseProjectUpdateRequestsList } from './BaseProjectUpdateRequestsList';

export const OrganizationProjectUpdateRequestsList = () => {
  const customer = useCustomer();
  const values = useFilterValues('marketplace-project-update-requests');

  const formFilter = useMemo(
    () => selectMarketplaceProjectUpdateRequestsFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({
      provider_uuid: customer?.uuid,
      ...formFilter,
    }),
    [customer?.uuid, formFilter],
  );

  return (
    <BaseProjectUpdateRequestsList
      filter={filter}
      filters={<MarketplaceProjectUpdateRequestsFilter />}
    />
  );
};
