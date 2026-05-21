import { useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';

import {
  MarketplaceProjectUpdateRequestsFilter,
  selectMarketplaceProjectUpdateRequestsFilter,
  MarketplaceProjectUpdateRequestsFilterFormId,
} from '@/table/generated/MarketplaceProjectUpdateRequestsFilter';
import { useCustomer } from '@/workspace/hooks';

import { BaseProjectUpdateRequestsList } from './BaseProjectUpdateRequestsList';

const OrganizationProjectUpdateRequestsListTable = () => {
  const customer = useCustomer();
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
