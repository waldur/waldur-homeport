import { FC, useMemo } from 'react';
import {
  MarketplaceProviderOfferingsListData,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { TableWithPortal } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';

import { OfferingsBulkActions } from '../actions/bulk/OfferingsBulkActions';
import { OFFERINGS_FILTER_FORM_ID } from '../constants';
import { BaseOfferingsList } from '../list/OfferingsList';
import { OfferingsListFilter } from '../list/OfferingsListFilter';
import { getStates } from '../list/OfferingStateFilter';

import { ADMIN_OFFERING_TABLE_NAME } from './constants';

export const buildOfferingsFilter = (filterValues: any) => {
  const filter: MarketplaceProviderOfferingsListData['query'] = {};
  if (filterValues?.organization) {
    // Older saved filters hold the raw provider, whose own uuid is not the
    // organization's.
    filter.customer_uuid =
      filterValues.organization.customer_uuid ?? filterValues.organization.uuid;
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

// Defined once, outside render: the table remounts the menu whenever this
// component's identity changes.
const AdminOfferingsBulkActions = (props: {
  rows: ProviderOfferingDetails[];
  refetch(): void;
}) => <OfferingsBulkActions {...props} table={ADMIN_OFFERING_TABLE_NAME} />;

export const AdminOfferingsList: FC<Partial<TableWithPortal>> = ({
  portal,
}) => {
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
      createInActionsMenu
      showProvider
      filters={<OfferingsListFilter />}
      portal={portal}
      multiSelectActions={AdminOfferingsBulkActions}
      initialFilters={{
        state: [getStates()[1], getStates()[2]],
        shared: { label: translate('Yes'), value: true },
      }}
    />
  );
};
