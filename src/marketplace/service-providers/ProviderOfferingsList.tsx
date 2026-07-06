import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  marketplaceServiceProvidersOfferingsList,
  marketplaceServiceProvidersOfferingsTypesList,
  ServiceProvider,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { getInitialValues } from '@/core/filters';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getLabel, getOfferingTypes } from '@/marketplace/common/registry';
import { createFetcher } from '@/table/api';
import { SLUG_COLUMN } from '@/table/slug';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CreateOfferingButton } from '../offerings/list/CreateOfferingButton';
import { OfferingActions } from '../offerings/list/OfferingActions';
import { OfferingDropdownActions } from '../offerings/list/OfferingDropdownActions';
import { OfferingGLAuthConfigActionItem } from '../offerings/list/OfferingGLAuthConfigActionItem';
import { getStates } from '../offerings/list/OfferingStateFilter';
import { OfferingStateField } from '../offerings/OfferingStateField';
import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { PROVIDER_OFFERINGS_FORM_ID } from './constants';
import { OfferingNameColumn } from './OfferingNameColumn';
import {
  getFiltersFromParams,
  ProviderOfferingsFilter,
} from './ProviderOfferingsFilter';
import { ResourcesCountColumn } from './ResourcesCountColumn';

interface ProviderOfferingsListProps {
  provider: ServiceProvider;
}

const mandatoryFields = [
  'uuid',
  'customer_uuid', // EditOfferingButton, DeleteOfferingButton
  'state', // PreviewOfferingButton, DeleteOfferingButton
  'components', // PreviewOfferingButton
  'type', // PreviewOfferingButton
  'resources_count', // DeleteOfferingButton
  'offering_group_uuid', // SetOfferingGroupAction (pre-populates current group)
  'offering_group_title', // SetOfferingGroupAction
  'service_provider_can_create_offering_user', // OfferingGLAuthConfigActionItem
];

export const ProviderOfferingsList: FC<ProviderOfferingsListProps> = ({
  provider,
}) => {
  const initialFilters = useMemo(
    () => getFiltersFromParams(getInitialValues()),
    [],
  );

  const filterValues = useFilterValues('ProviderOfferingsList');

  const filter = useMemo(() => {
    const result: Record<string, any> = {};
    if (filterValues?.state) {
      result.state = filterValues.state.map((option) => option.value);
    }
    if (filterValues?.offering_type) {
      result.type = filterValues.offering_type.value;
    }
    if (filterValues?.tag) {
      result.tag = filterValues.tag.uuid;
    }
    return result;
  }, [filterValues]);

  const tableProps = useTable({
    table: 'ProviderOfferingsList',
    fetchData: createFetcher(marketplaceServiceProvidersOfferingsList, {
      path: { service_provider_uuid: provider?.uuid },
    }),
    filter,
    queryField: 'name',
    mandatoryFields,
    initialFilters,
    syncFiltersToURL: true,
  });

  const { data: offeringTypeStrings } = useQuery({
    queryKey: ['providerOfferingTypes', provider?.uuid],
    queryFn: () =>
      marketplaceServiceProvidersOfferingsTypesList({
        path: { service_provider_uuid: provider.uuid },
      }).then((r) => r.data),
    enabled: Boolean(provider?.uuid),
    staleTime: UI_STALE_TIME,
  });

  const offeringTypes = useMemo(() => {
    if (!offeringTypeStrings) return [];
    const presentTypes = new Set(offeringTypeStrings);
    return getOfferingTypes().filter((t) => presentTypes.has(t.value));
  }, [offeringTypeStrings]);

  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }

  return (
    <Table
      {...tableProps}
      formId={PROVIDER_OFFERINGS_FORM_ID}
      columns={[
        {
          title: translate('Offering / Category'),
          render: OfferingNameColumn,
          id: 'name',
          keys: ['name', 'backend_id', 'uuid', 'category_title'],
        },
        {
          title: translate('Offering group'),
          render: ({ row }) => renderFieldOrDash(row.offering_group_title),
          id: 'offering_group',
          keys: ['offering_group_uuid', 'offering_group_title'],
        },
        {
          title: translate('Type'),
          render: ({ row }) => getLabel(row.type),
          filter: 'offering_type',
          inlineFilter: (row) =>
            getOfferingTypes().find((op) => op.value === row.type),
          id: 'type',
          keys: ['type'],
        },
        {
          title: translate('Resources'),
          render: ResourcesCountColumn,
          id: 'resources_count',
          keys: ['resources_count'],
        },
        {
          title: translate('Estimated cost'),
          render: ({ row }) =>
            defaultCurrency(row.billing_price_estimate?.total || 0),
          id: 'billing_price_estimate',
          keys: ['billing_price_estimate'],
        },
        {
          title: translate('State'),
          render: ({ row }) => <OfferingStateField offering={row} />,
          filter: 'state',
          inlineFilter: (row) =>
            getStates().filter((op) => op.value === row.state),
          id: 'state',
          keys: ['state'],
        },
        SLUG_COLUMN,
      ]}
      verboseName={translate('Offerings')}
      dropdownActions={<OfferingDropdownActions refetch={tableProps.fetch} />}
      tableActions={<CreateOfferingButton fetch={tableProps.fetch} />}
      rowActions={(row) => (
        <OfferingActions
          row={row.row}
          refetch={tableProps.fetch}
          extraActions={[OfferingGLAuthConfigActionItem]}
        />
      )}
      filters={<ProviderOfferingsFilter offeringTypes={offeringTypes} />}
      hasQuery={true}
      hasOptionalColumns
    />
  );
};
