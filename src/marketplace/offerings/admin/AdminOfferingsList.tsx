import { useMemo } from 'react';
import { MarketplaceProviderOfferingsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useFilterValues } from '@/table/useFilterValues';

import { OFFERINGS_FILTER_FORM_ID } from '../constants';
import { BaseOfferingsList } from '../list/OfferingsList';
import { OfferingsListFilter } from '../list/OfferingsListFilter';
import { getStates } from '../list/OfferingStateFilter';

import { ADMIN_OFFERING_TABLE_NAME } from './constants';

export const buildOfferingsFilter = (filterValues: any) => {
  const filter: MarketplaceProviderOfferingsListData['query'] = {};
  if (filterValues?.organization) {
    filter.customer_uuid = filterValues.organization.customer_uuid;
  }
  if (filterValues) {
    if (filterValues.state && Array.isArray(filterValues.state)) {
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
    if (filterValues.shared !== undefined && filterValues.shared !== null) {
      filter.shared =
        typeof filterValues.shared === 'object'
          ? filterValues.shared.value
          : filterValues.shared;
    }
  }
  return filter;
};

export const AdminOfferingsList = () => {
  const filterValues = useFilterValues(ADMIN_OFFERING_TABLE_NAME);

  const filter = useMemo(
    () => buildOfferingsFilter(filterValues),
    [filterValues],
  );

  return (
    <BaseOfferingsList
      table={ADMIN_OFFERING_TABLE_NAME}
      filter={filter}
      formId={OFFERINGS_FILTER_FORM_ID}
      hasOrganizationColumn
      showActions
      showProvider
      filters={<OfferingsListFilter />}
      initialFilters={{
        state: [getStates()[1], getStates()[2]],
        shared: { label: translate('Yes'), value: true },
      }}
    />
  );
};
