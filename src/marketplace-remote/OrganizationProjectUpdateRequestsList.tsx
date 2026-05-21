import { useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { useSelector } from 'react-redux';

import {
  MarketplaceProjectUpdateRequestsFilter,
  selectMarketplaceProjectUpdateRequestsFilter,
  MarketplaceProjectUpdateRequestsFilterFormId,
} from '@/table/generated/MarketplaceProjectUpdateRequestsFilter';
import { getCustomer } from '@/workspace/selectors';

import { BaseProjectUpdateRequestsList } from './BaseProjectUpdateRequestsList';

const OrganizationProjectUpdateRequestsListTable = () => {
  const customer = useSelector(getCustomer);
  const { values } = useFormState();

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

export const OrganizationProjectUpdateRequestsList = (props) => (
  <Form
    id={MarketplaceProjectUpdateRequestsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <OrganizationProjectUpdateRequestsListTable {...props} />}
  </Form>
);
