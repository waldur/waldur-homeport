import { useMemo } from 'react';
import { EventsListData } from 'waldur-js-client';

import { isEmpty } from '@/core/utils';
import { BaseEventsList } from '@/events/BaseEventsList';
import {
  CustomerEventsFilter,
  CustomerEventsFilterFormId,
  selectCustomerEventsFilter,
} from '@/table/generated/CustomerEventsFilter';
import { useFilterValues } from '@/table/useFilterValues';
import { useCustomer } from '@/workspace/hooks';

export const CustomerEventsList = () => {
  const customer = useCustomer();
  const tableId = `customer-events-${customer.uuid}`;
  const values = useFilterValues(tableId);
  const userFilter = useMemo(
    () => selectCustomerEventsFilter(values),
    [values],
  );

  const filter = useMemo(() => {
    if (!customer) return undefined;
    const result: EventsListData['query'] = {
      ...userFilter,
      scope: customer.url,
    };
    if (isEmpty(userFilter.feature)) {
      result.feature = ['customers', 'projects', 'resources'];
    }
    return result;
  }, [customer, userFilter]);

  if (!customer) return null;

  return (
    <BaseEventsList
      table={tableId}
      formId={CustomerEventsFilterFormId}
      filter={filter}
      filters={<CustomerEventsFilter />}
    />
  );
};
