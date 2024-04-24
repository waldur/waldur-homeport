import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { getCustomer } from '@waldur/workspace/selectors';

import { BaseProjectUpdateRequestsList } from './BaseProjectUpdateRequestsList';
import { OrganizationProjectUpdateRequestListFilter } from './OrganizationProjectUpdateRequestListFilter';

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues('OrganizationProjectUpdateRequestListFilter'),
  (customer, filterValues: any) => {
    const filter: Record<string, any> = {
      offering_customer_uuid: customer.uuid,
    };
    if (filterValues?.state) {
      filter.state = filterValues.state?.map((choice) => choice.value);
    }
    if (filterValues?.organization) {
      filter.customer_uuid = filterValues.organization?.uuid;
    }
    return filter;
  },
);

export const OrganizationProjectUpdateRequestsList = () => {
  const filter = useSelector(mapStateToFilter);
  return (
    <BaseProjectUpdateRequestsList
      filter={filter}
      filters={<OrganizationProjectUpdateRequestListFilter />}
    />
  );
};
