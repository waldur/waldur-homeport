import { FunctionComponent, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplaceOfferingGroupsList,
  OfferingGroup,
  ServiceProvider,
} from 'waldur-js-client';

import { tabTableProps } from '@/administration/tabTableProps';
import { formatDateTime } from '@/core/dateUtils';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { CustomerResourcesListPlaceholder } from '@/marketplace/resources/list/CustomerResourcesListPlaceholder';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import { OfferingGroupCreateButton } from './OfferingGroupCreateButton';
import { OfferingGroupRowActions } from './OfferingGroupRowActions';
import { ProviderOfferingGroupOfferingsExpandable } from './ProviderOfferingGroupOfferingsExpandable';

interface OfferingGroupsListViewProps {
  tableKey: string;
  filter?: Record<string, unknown>;
  customerUrl?: string;
  showCustomerColumn?: boolean;
  portal?: TableWithPortal['portal'];
  showCreateButton?: boolean;
}

const OfferingGroupsListView: FunctionComponent<
  OfferingGroupsListViewProps
> = ({
  tableKey,
  filter,
  customerUrl,
  showCustomerColumn,
  showCreateButton,
  portal,
}) => {
  const tableProps = useTable({
    table: tableKey,
    fetchData: createFetcher(marketplaceOfferingGroupsList),
    filter,
    queryField: 'title',
  });

  const ExpandableRow = useCallback(
    ({ row }: { row: OfferingGroup }) => (
      <ProviderOfferingGroupOfferingsExpandable group={row} />
    ),
    [],
  );

  const RowActions = useCallback(
    ({ row }: { row: OfferingGroup }) => (
      <OfferingGroupRowActions
        row={row}
        refetch={tableProps.fetch}
        customerUrl={customerUrl}
      />
    ),
    [tableProps.fetch, customerUrl],
  );

  const columns = useMemo(
    () => [
      {
        title: translate('Title'),
        render: ({ row }: { row: OfferingGroup }) => row.title,
        copyField: (row: OfferingGroup) => row.title,
      },
      ...(showCustomerColumn
        ? [
            {
              title: translate('Organization'),
              render: ({ row }: { row: OfferingGroup }) =>
                renderFieldOrDash(row.customer_name),
            },
          ]
        : []),
      {
        title: translate('Description'),
        render: ({ row }: { row: OfferingGroup }) =>
          row.description ? (
            <>{truncate(row.description, 80)}</>
          ) : (
            renderFieldOrDash(null)
          ),
      },
      {
        title: translate('Created'),
        render: ({ row }: { row: OfferingGroup }) => (
          <>{formatDateTime(row.created)}</>
        ),
      },
    ],
    [showCustomerColumn],
  );

  return (
    <Table<OfferingGroup>
      {...tableProps}
      {...tabTableProps(portal)}
      columns={columns}
      verboseName={translate('offering groups')}
      initialSorting={{ field: 'title', mode: 'asc' }}
      hasQuery={true}
      tableActions={
        showCreateButton ? (
          <OfferingGroupCreateButton
            customerUrl={customerUrl}
            refetch={tableProps.fetch}
          />
        ) : undefined
      }
      rowActions={RowActions}
      expandableRow={ExpandableRow}
      showPageSizeSelector={true}
    />
  );
};

export const ProviderOfferingGroupsList = ({
  provider,
}: {
  provider?: ServiceProvider;
}) => {
  const filter = useMemo(
    () => (provider ? { customer_uuid: provider.customer_uuid } : undefined),
    [provider?.customer_uuid],
  );

  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return (
    <OfferingGroupsListView
      tableKey="marketplace-provider-offering-groups"
      filter={filter}
      customerUrl={provider.customer as string}
      showCreateButton
    />
  );
};

// Support can read the admin list, but creating a group for another
// organization's provider is staff-only on the backend.
export const AdminOfferingGroupsList: FunctionComponent<
  Partial<TableWithPortal>
> = ({ portal }) => {
  const isStaff = useSelector(isStaffSelector);
  return (
    <OfferingGroupsListView
      tableKey="admin-marketplace-offering-groups"
      showCustomerColumn
      showCreateButton={isStaff}
      portal={portal}
    />
  );
};
