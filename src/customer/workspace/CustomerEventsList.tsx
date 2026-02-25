import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { EventsListData } from 'waldur-js-client';

import { isEmpty } from '@waldur/core/utils';
import { BaseEventsList } from '@waldur/events/BaseEventsList';
import {
  CustomerEventsFilter,
  selectCustomerEventsFilter,
} from '@waldur/table/generated/CustomerEventsFilter';
import { getCustomer } from '@waldur/workspace/selectors';

const mapStateToFilter = createSelector(
  getCustomer,
  selectCustomerEventsFilter,
  (customer, userFilter) => {
    const filter: EventsListData['query'] = {
      ...userFilter,
      scope: customer.url,
    };
    if (isEmpty(userFilter.feature)) {
      filter.feature = ['customers', 'projects', 'resources'];
    }
    return filter;
  },
);

export const CustomerEventsList = () => {
  const customer = useSelector(getCustomer);
  const filter = useSelector(mapStateToFilter);
  return (
    <BaseEventsList
      table={`customer-events-${customer.uuid}`}
      filter={filter}
      filters={<CustomerEventsFilter />}
    />
  );
};
