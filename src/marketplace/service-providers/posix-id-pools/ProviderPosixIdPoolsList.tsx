import { FunctionComponent, useCallback, useMemo } from 'react';
import { Badge } from 'react-bootstrap';
import {
  marketplacePosixIdPoolsList,
  PosixIdPool,
  ServiceProvider,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { ProgressBar } from '@/core/ProgressBar';
import { translate } from '@/i18n';
import { CustomerResourcesListPlaceholder } from '@/marketplace/resources/list/CustomerResourcesListPlaceholder';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { PosixIdPoolCreateButton } from './PosixIdPoolCreateButton';
import { PosixIdPoolRowActions } from './PosixIdPoolRowActions';
import { PosixIdPoolStatsExpandable } from './PosixIdPoolStatsExpandable';

const utilizationVariant = (utilization: number) =>
  utilization >= 90 ? 'danger' : utilization >= 70 ? 'warning' : 'success';

const getScopeLabel = (scope?: string) =>
  scope === 'offering' ? translate('Offering') : translate('Service provider');

interface PosixIdPoolsListViewProps {
  tableKey: string;
  filter?: Record<string, unknown>;
  provider?: ServiceProvider;
  showCustomerColumn?: boolean;
  showCreateButton?: boolean;
}

const PosixIdPoolsListView: FunctionComponent<PosixIdPoolsListViewProps> = ({
  tableKey,
  filter,
  provider,
  showCustomerColumn,
  showCreateButton,
}) => {
  const tableProps = useTable({
    table: tableKey,
    fetchData: createFetcher(marketplacePosixIdPoolsList),
    filter,
  });

  const RowActions = useCallback(
    ({ row }: { row: PosixIdPool }) => (
      <PosixIdPoolRowActions row={row} refetch={tableProps.fetch} />
    ),
    [tableProps.fetch],
  );

  const ExpandableRow = useCallback(
    ({ row }: { row: PosixIdPool }) => <PosixIdPoolStatsExpandable row={row} />,
    [],
  );

  const columns = useMemo(
    () => [
      {
        title: translate('Scope'),
        render: ({ row }: { row: PosixIdPool }) => (
          <Badge bg="light-primary" text="primary">
            {getScopeLabel(row.scope)}
          </Badge>
        ),
      },
      {
        title: translate('UID range'),
        render: ({ row }: { row: PosixIdPool }) =>
          row.min_uid == null ? (
            <>{renderFieldOrDash(null)}</>
          ) : (
            <>
              {row.min_uid} – {row.max_uid}
            </>
          ),
        copyField: (row: PosixIdPool) =>
          row.min_uid == null ? '' : `${row.min_uid}-${row.max_uid}`,
      },
      {
        title: translate('GID range'),
        render: ({ row }: { row: PosixIdPool }) =>
          row.min_gid == null ? (
            <>{renderFieldOrDash(null)}</>
          ) : (
            <>
              {row.min_gid} – {row.max_gid}
            </>
          ),
        copyField: (row: PosixIdPool) =>
          row.min_gid == null ? '' : `${row.min_gid}-${row.max_gid}`,
      },
      ...(showCustomerColumn
        ? [
            {
              title: translate('Organization'),
              render: ({ row }: { row: PosixIdPool }) =>
                renderFieldOrDash(row.customer_name),
            },
          ]
        : []),
      {
        title: translate('UID utilization'),
        render: ({ row }: { row: PosixIdPool }) => (
          <div style={{ minWidth: 90 }}>
            <ProgressBar
              now={row.uid_utilization ?? 0}
              showValue
              compact
              variant={utilizationVariant(row.uid_utilization ?? 0)}
            />
          </div>
        ),
      },
      {
        title: translate('GID utilization'),
        render: ({ row }: { row: PosixIdPool }) => (
          <div style={{ minWidth: 90 }}>
            <ProgressBar
              now={row.gid_utilization ?? 0}
              showValue
              compact
              variant={utilizationVariant(row.gid_utilization ?? 0)}
            />
          </div>
        ),
      },
      {
        title: translate('Description'),
        render: ({ row }: { row: PosixIdPool }) =>
          renderFieldOrDash(row.description),
      },
      {
        title: translate('Created'),
        render: ({ row }: { row: PosixIdPool }) => (
          <>{formatDateTime(row.created)}</>
        ),
      },
    ],
    [showCustomerColumn],
  );

  return (
    <Table<PosixIdPool>
      {...tableProps}
      columns={columns}
      verboseName={translate('POSIX ID pools')}
      initialSorting={{ field: 'min_uid', mode: 'asc' }}
      tableActions={
        showCreateButton && provider ? (
          <PosixIdPoolCreateButton
            providerUuid={provider.uuid as string}
            customerUuid={provider.customer_uuid as string}
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

export const ProviderPosixIdPoolsList: FunctionComponent<{
  provider?: ServiceProvider;
}> = ({ provider }) => {
  const filter = useMemo(
    () => (provider ? { customer_uuid: provider.customer_uuid } : undefined),
    [provider?.customer_uuid],
  );

  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }

  return (
    <PosixIdPoolsListView
      tableKey="marketplace-provider-posix-id-pools"
      filter={filter}
      provider={provider}
      showCreateButton
    />
  );
};

export const AdminPosixIdPoolsList: FunctionComponent = () => (
  <PosixIdPoolsListView
    tableKey="admin-marketplace-posix-id-pools"
    showCustomerColumn
  />
);
