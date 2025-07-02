import { FunctionComponent } from 'react';
import {
  MarketplaceProviderOfferingsListData,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import {
  getLabel,
  getOfferingTypes,
} from '@waldur/marketplace/common/registry';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import { SLUG_COLUMN } from '@waldur/table/slug';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { useOfferingDropdownActions } from '../hooks';

import { CreateOfferingButton } from './CreateOfferingButton';
import { OfferingActions } from './OfferingActions';
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
  filters?;
}> = ({ table, filter, hasOrganizationColumn, showActions, filters }) => {
  const props = useTable({
    table,
    filter,
    fetchData: createFetcher('marketplace-provider-offerings'),
    queryField: 'keyword',
    mandatoryFields,
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
      title: translate('Shared'),
      render: ({ row }) => <BooleanField value={row.shared} />,
      id: 'shared',
      filter: 'shared',
      keys: ['shared'],
      optional: true,
    },
    SLUG_COLUMN as Column<ProviderOfferingDetails>,
  ];

  const dropdownActions = useOfferingDropdownActions(props.fetch);

  return (
    <Table
      {...props}
      placeholderActions={
        showActions && <CreateOfferingButton className="w-175px mw-350px" />
      }
      columns={columns}
      verboseName={translate('Offerings')}
      dropdownActions={showActions && dropdownActions}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      rowActions={
        showActions
          ? ({ row }) => <OfferingActions row={row} refetch={props.fetch} />
          : null
      }
      hasQuery={true}
      filters={filters}
      hasOptionalColumns
    />
  );
};
