import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { BaseOfferingsList } from '../list/OfferingsList';

import { AdminOfferingsFilter } from './AdminOfferingsFilter';
import {
  ADMIN_OFFERINGS_FILTER_FORM_ID,
  ADMIN_OFFERING_TABLE_NAME,
} from './constants';

const mapStateToFilter = createSelector(
  getFormValues(ADMIN_OFFERINGS_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: Record<string, any> = {
      billable: true,
      shared: true,
    };
    if (filterValues?.organization) {
      filter.customer_uuid = filterValues.organization.uuid;
    }
    if (filterValues?.state) {
      filter.state = filterValues.state.map((option) => option.value);
    }
    if (filterValues?.offering_type) {
      filter.type = filterValues.offering_type.value;
    }
    return filter;
  },
);

export const AdminOfferingsList = () => {
  const filter = useSelector(mapStateToFilter);
  return (
    <BaseOfferingsList
      table={ADMIN_OFFERING_TABLE_NAME}
      filter={filter}
      hasOrganizationColumn
      showActions
      filters={<AdminOfferingsFilter />}
    />
  );
};
