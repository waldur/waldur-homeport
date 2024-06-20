import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { BaseOfferingsList } from '../list/OfferingsList';
import { getStates } from '../list/OfferingStateFilter';

import { AdminOfferingsFilter } from './AdminOfferingsFilter';
import {
  ADMIN_OFFERING_TABLE_NAME,
  ADMIN_OFFERINGS_FILTER_FORM_ID,
} from './constants';

export const mapStateToFilter = createSelector(
  getFormValues(ADMIN_OFFERINGS_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: Record<string, any> = {};
    if (filterValues?.organization) {
      filter.customer_uuid = filterValues.organization.uuid;
    }
    if (filterValues?.state) {
      filter.state = filterValues.state.map((option) => option.value);
    }
    if (filterValues?.offering_type) {
      filter.type = filterValues.offering_type.value;
    }
    if (filterValues?.category) {
      filter.category_uuid = filterValues.category.uuid;
    }
    return filter;
  },
);

export const AdminOfferingsList = () => {
  const filter = useSelector(mapStateToFilter);
  const initialValues = useMemo(
    () => ({
      state: [getStates()[1], getStates()[2]],
    }),
    [],
  );
  return (
    <BaseOfferingsList
      table={ADMIN_OFFERING_TABLE_NAME}
      filter={filter}
      hasOrganizationColumn
      showActions
      filters={<AdminOfferingsFilter initialValues={initialValues} />}
    />
  );
};
