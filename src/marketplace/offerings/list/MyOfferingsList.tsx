import { useMemo } from 'react';
import { MarketplaceProviderOfferingsListData } from 'waldur-js-client';

import {
  MarketplaceProviderOfferingsFilter,
  MarketplaceProviderOfferingsFilterFormId,
  selectMarketplaceProviderOfferingsFilter,
} from '@/table/generated/MarketplaceProviderOfferingsFilter';
import { useFilterValues } from '@/table/useFilterValues';
import { useCustomer } from '@/workspace/hooks';

import { BaseOfferingsList } from './OfferingsList';

export const MyOfferingsList = () => {
  const customer = useCustomer();
  const values = useFilterValues('marketplace-my-offerings');
  const filterValues = useMemo(
    () => selectMarketplaceProviderOfferingsFilter(values),
    [values],
  );

  const filter = useMemo(() => {
    const result: MarketplaceProviderOfferingsListData['query'] = {
      ...filterValues,
      billable: false,
    };
    if (customer) {
      result.customer_uuid = customer.uuid;
    }
    return result;
  }, [customer, filterValues]);

  return (
    <BaseOfferingsList
      table="marketplace-my-offerings"
      formId={MarketplaceProviderOfferingsFilterFormId}
      filter={filter}
      showActions={false}
      filters={<MarketplaceProviderOfferingsFilter />}
    />
  );
};
