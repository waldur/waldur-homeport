import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { MarketplaceProviderOfferingsListData } from 'waldur-js-client';

import { BaseOfferingsList } from '../list/OfferingsList';
import { getStates } from '../list/OfferingStateFilter';

import { AdminOfferingsFilter } from './AdminOfferingsFilter';
import {
  ADMIN_OFFERING_TABLE_NAME,
  ADMIN_OFFERINGS_FILTER_FORM_ID,
} from './constants';

type AdminOfferingsFilter = MarketplaceProviderOfferingsListData['query'] & {
  tag?: string; // TODO: Remove once SDK includes tag filter support
};

export const mapStateToFilter = createSelector(
  getFormValues(ADMIN_OFFERINGS_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: AdminOfferingsFilter = {};
    if (filterValues?.organization) {
      filter.customer_uuid = filterValues.organization.uuid;
    }
    if (filterValues) {
      if (filterValues.state) {
        filter.state = filterValues.state.map((option) => option.value);
      }
      if (filterValues.offering_type) {
        filter.type = filterValues.offering_type.value;
      }
      if (filterValues.category) {
        filter.category_uuid = filterValues.category.uuid;
      }
      if (filterValues.tag) {
        filter.tag = filterValues.tag.uuid;
      }
      if (filterValues.shared) {
        filter.shared = filterValues.shared;
      }
    }
    return filter;
  },
);

export const AdminOfferingsList = () => {
  const filter = useSelector(mapStateToFilter);
  const initialValues = useMemo(
    () => ({
      state: [getStates()[1], getStates()[2]],
      shared: true,
    }),
    [],
  );
  return (
    <BaseOfferingsList
      table={ADMIN_OFFERING_TABLE_NAME}
      filter={filter}
      hasOrganizationColumn
      showActions
      showProvider
      filters={<AdminOfferingsFilter initialValues={initialValues} />}
    />
  );
};
