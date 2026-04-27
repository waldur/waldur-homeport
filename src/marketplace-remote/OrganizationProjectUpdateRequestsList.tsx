import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  MarketplaceProjectUpdateRequestsFilter,
  selectMarketplaceProjectUpdateRequestsFilter,
} from '@/table/generated/MarketplaceProjectUpdateRequestsFilter';
import { getCustomer } from '@/workspace/selectors';

import { BaseProjectUpdateRequestsList } from './BaseProjectUpdateRequestsList';

export const OrganizationProjectUpdateRequestsList = () => {
  const customer = useSelector(getCustomer);
  const formFilter = useSelector(selectMarketplaceProjectUpdateRequestsFilter);
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
