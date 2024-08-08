import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { useOfferingDropdownActions } from '../hooks';

import { OfferingActions } from './OfferingActions';
import { OfferingNameColumn } from './OfferingNameColumn';
import { OfferingsListTablePlaceholder } from './OfferingsListTablePlaceholder';
import { OfferingStateCell } from './OfferingStateCell';

export const BaseOfferingsList: FunctionComponent<{
  table: string;
  filter;
  hasOrganizationColumn?: boolean;
  showActions?: boolean;
  filters?;
}> = ({ table, filter, hasOrganizationColumn, showActions, filters }) => {
  const props = useTable({
    table,
    filter,
    fetchData: createFetcher('marketplace-provider-offerings'),
    queryField: 'keyword',
  });

  const organizationColumn = hasOrganizationColumn
    ? [
        {
          title: translate('Organization'),
          render: ({ row }) => renderFieldOrDash(row.customer_name),
          filter: 'organization',
          export: 'customer_name',
        },
      ]
    : [];

  const columns = [
    {
      title: translate('Name'),
      render: OfferingNameColumn,
      orderField: 'name',
      export: 'name',
    },
    ...organizationColumn,
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
      filter: 'category',
      export: 'category_title',
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
    },
    {
      title: translate('State'),
      render: OfferingStateCell,
      filter: 'state',
      export: 'state',
    },
    {
      title: translate('Type'),
      render: ({ row }) => <>{getLabel(row.type)}</>,
      filter: 'offering_type',
      export: (row) => getLabel(row.type),
      exportKeys: ['type'],
    },
  ];

  const dropdownActions = useOfferingDropdownActions();

  return (
    <Table
      {...props}
      placeholderComponent={
        <OfferingsListTablePlaceholder showActions={showActions} />
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
    />
  );
};
