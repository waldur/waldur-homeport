import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { MarketplaceProviderOfferingsListData } from 'waldur-js-client';

import {
  MarketplaceProviderOfferingsFilter,
  selectMarketplaceProviderOfferingsFilter,
} from '@waldur/table/generated/MarketplaceProviderOfferingsFilter';
import { getCustomer } from '@waldur/workspace/selectors';

import { BaseOfferingsList } from './OfferingsList';

const mapStateToFilter = createSelector(
  getCustomer,
  selectMarketplaceProviderOfferingsFilter,
  (customer, filterValues) => {
    const filter: MarketplaceProviderOfferingsListData['query'] = {
      ...filterValues,
      billable: false,
    };
    if (customer) {
      filter.customer_uuid = customer.uuid;
    }
    return filter;
  },
);

export const MyOfferingsList = () => {
  const filter = useSelector(mapStateToFilter);
  return (
    <BaseOfferingsList
      table="marketplace-my-offerings"
      filter={filter}
      showActions={false}
      filters={<MarketplaceProviderOfferingsFilter />}
    />
  );
};
