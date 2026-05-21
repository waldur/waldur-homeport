import { useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { useSelector } from 'react-redux';
import { EventsListData } from 'waldur-js-client';

import { isEmpty } from '@/core/utils';
import { BaseEventsList } from '@/events/BaseEventsList';
import {
  CustomerEventsFilter,
  CustomerEventsFilterFormId,
  selectCustomerEventsFilter,
} from '@/table/generated/CustomerEventsFilter';
import { getCustomer } from '@/workspace/selectors';

const CustomerEventsListTable = () => {
  const customer = useSelector(getCustomer);
  const { values } = useFormState();
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
      table={`customer-events-${customer.uuid}`}
      formId={CustomerEventsFilterFormId}
      filter={filter}
      filters={<CustomerEventsFilter />}
    />
  );
};

export const CustomerEventsList = () => (
  <Form
    id={CustomerEventsFilterFormId}
    onSubmit={() => {}}
    subscription={{ values: true }}
  >
    {() => <CustomerEventsListTable />}
  </Form>
);
