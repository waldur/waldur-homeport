import { FunctionComponent } from 'react';
import {
  marketplaceProviderOfferingsList,
  MarketplaceProviderOfferingsListData,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getLabel, getOfferingTypes } from '@/marketplace/common/registry';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { SLUG_COLUMN } from '@/table/slug';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CreateOfferingButton } from './CreateOfferingButton';
import { OfferingActions } from './OfferingActions';
import { OfferingDropdownActions } from './OfferingDropdownActions';
import { OfferingNameColumn } from './OfferingNameColumn';
import { OfferingStateCell } from './OfferingStateCell';
import { getStates } from './OfferingStateFilter';

const mandatoryFields: MarketplaceProviderOfferingsListData['query']['field'] =
  ['customer_uuid', 'components', 'plans'];

export const BaseOfferingsList: FunctionComponent<{
  table: string;
  filter: MarketplaceProviderOfferingsListData['query'];
  hasOrganizationColumn?: boolean;
  showActions?: boolean;
  showProvider?: boolean;
  filters?;
  formId?: string;
  initialFilters?;
}> = ({
  table,
  filter,
  hasOrganizationColumn,
  showActions,
  showProvider,
  filters,
  formId,
  initialFilters,
}) => {
  const props = useTable({
    table,
    filter,
    fetchData: createFetcher(marketplaceProviderOfferingsList),
    queryField: 'keyword',
    mandatoryFields,
    initialFilters,
  });

  const organizationColumn: Column<ProviderOfferingDetails>[] =
    hasOrganizationColumn
      ? [
          {
            title: translate('Organization'),
            render: ({ row }) => renderFieldOrDash(row.customer_name),
            filter: 'organization',
            inlineFilter: (row) => ({
              name: row.customer_name,
              uuid: row.customer_uuid,
            }),
            export: 'customer_name',
            keys: ['customer_name'],
            id: 'organization',
          },
        ]
      : [];

  const costColumn: Column<ProviderOfferingDetails>[] = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  )
    ? []
    : [
        {
          title: translate('Cost (previous month)'),
          render: ({ row }) =>
            row.total_cost == null ? (
              <>{DASH_ESCAPE_CODE}</>
            ) : (
              <>{defaultCurrency(row.total_cost)}</>
            ),
          orderField: 'total_cost',
          export: (row) =>
            row.total_cost == null
              ? DASH_ESCAPE_CODE
              : defaultCurrency(row.total_cost),
          exportKeys: ['total_cost'],
          keys: ['total_cost'],
          id: 'total_cost',
          optional: true,
        },
      ];

  const columns: Column<ProviderOfferingDetails>[] = [
    {
      title: translate('Name'),
      render: OfferingNameColumn,
      orderField: 'name',
      export: 'name',
      keys: ['name'],
      id: 'name',
    },
    ...organizationColumn,
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
      filter: 'category',
      inlineFilter: (row) => ({
        uuid: row.category_uuid,
        title: row.category_title,
      }),
      export: 'category_title',
      keys: ['category_title'],
      id: 'category',
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
      keys: ['created'],
      id: 'created',
    },
    {
      title: translate('State'),
      render: OfferingStateCell,
      filter: 'state',
      inlineFilter: (row) => getStates().filter((op) => op.value === row.state),
      export: 'state',
      keys: ['state'],
      id: 'state',
    },
    {
      title: translate('Type'),
      render: ({ row }) => <>{getLabel(row.type)}</>,
      filter: 'offering_type',
      inlineFilter: (row) =>
        getOfferingTypes().find((op) => op.value === row.type),
      export: (row) => getLabel(row.type),
      exportKeys: ['type'],
      keys: ['type'],
      id: 'type',
    },
    {
      title: translate('Customers'),
      render: ({ row }) => <>{row.total_customers ?? DASH_ESCAPE_CODE}</>,
      orderField: 'total_customers',
      export: 'total_customers',
      keys: ['total_customers'],
      id: 'total_customers',
      optional: true,
    },
    ...costColumn,
    {
      title: translate('Shared'),
      render: ({ row }) => <BooleanField value={row.shared} />,
      id: 'shared',
      filter: 'shared',
      keys: ['shared'],
      optional: true,
    },
    SLUG_COLUMN as Column<ProviderOfferingDetails>,
  ];

  return (
    <Table
      {...props}
      placeholderActions={
        showActions && <CreateOfferingButton className="w-175px mw-350px" />
      }
      tableActions={
        showActions && (
          <CreateOfferingButton
            showProvider={showProvider}
            fetch={props.fetch}
          />
        )
      }
      columns={columns}
      verboseName={translate('Offerings')}
      dropdownActions={<OfferingDropdownActions refetch={props.fetch} />}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      rowActions={
        showActions
          ? ({ row }) => <OfferingActions row={row} refetch={props.fetch} />
          : null
      }
      hasQuery={true}
      formId={formId}
      filters={filters}
      hasOptionalColumns
    />
  );
};
