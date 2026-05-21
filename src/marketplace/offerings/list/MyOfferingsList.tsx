import { useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { useSelector } from 'react-redux';
import { MarketplaceProviderOfferingsListData } from 'waldur-js-client';

import {
  MarketplaceProviderOfferingsFilter,
  MarketplaceProviderOfferingsFilterFormId,
  selectMarketplaceProviderOfferingsFilter,
} from '@/table/generated/MarketplaceProviderOfferingsFilter';
import { getCustomer } from '@/workspace/selectors';

import { BaseOfferingsList } from './OfferingsList';

const MyOfferingsListTable = () => {
  const customer = useSelector(getCustomer);
  const { values } = useFormState();
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

export const MyOfferingsList = () => (
  <Form
    id={MarketplaceProviderOfferingsFilterFormId}
    onSubmit={() => {}}
    subscription={{ values: true }}
  >
    {() => <MyOfferingsListTable />}
  </Form>
);
