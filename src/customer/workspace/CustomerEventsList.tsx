import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { isEmpty } from '@waldur/core/utils';
import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { getCustomer } from '@waldur/workspace/selectors';

import { CustomerEventsFilter } from './CustomerEventsFilter';

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues('customerEventsFilter'),
  (customer, userFilter: any) => {
    const filter = {
      ...userFilter,
      feature: userFilter?.feature?.map((option) => option.value),
      scope: customer.url,
    };
    if (userFilter && isEmpty(userFilter.feature)) {
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
