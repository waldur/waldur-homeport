import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { dataAccessLogsList, GlobalUserDataAccessLog } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import {
  DataAccessLogsFilter as SupportDataAccessLogsFilter,
  selectDataAccessLogsFilter as selectSupportDataAccessLogsFilter,
} from '@waldur/table/generated/DataAccessLogsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import {
  getAccessorCategory,
  getAccessorTypeBadgeVariant,
} from '@waldur/user/data-access/utils';

import { DataAccessLogsBulkDeleteAction } from './DataAccessLogsBulkDeleteAction';
import { DataAccessLogsRowActions } from './DataAccessLogsRowActions';
import { SupportDataAccessLogsExpandableRow } from './SupportDataAccessLogsExpandableRow';

export const SupportDataAccessLogsList = () => {
  const filterValues = useSelector(selectSupportDataAccessLogsFilter);

  const filter = useMemo(
    () => ({
      ...filterValues,
    }),
    [filterValues],
  );

  const tableProps = useTable({
    table: 'SupportDataAccessLogsList',
    fetchData: createFetcher(dataAccessLogsList),
    filter,
    queryField: 'query',
  });

  const columns = useMemo(
    () => [
      {
        title: translate('Timestamp'),
        orderField: 'timestamp',
        render: ({ row }: { row: GlobalUserDataAccessLog }) => (
          <>{formatDateTime(row.timestamp)}</>
        ),
        export: (row: GlobalUserDataAccessLog) => formatDateTime(row.timestamp),
      },
      {
        title: translate('User'),
        render: ({ row }: { row: GlobalUserDataAccessLog }) => (
          <Link
            state="admin-user-users.details"
            params={{ user_uuid: row.user.uuid }}
          >
            {row.user.full_name || row.user.username}
          </Link>
        ),
        export: (row: GlobalUserDataAccessLog) =>
          row.user.full_name || row.user.username,
      },
      {
        title: translate('Accessor'),
        render: ({ row }: { row: GlobalUserDataAccessLog }) => (
          <Link
            state="admin-user-users.details"
            params={{ user_uuid: row.accessor.uuid }}
          >
            {row.accessor.full_name || row.accessor.username}
          </Link>
        ),
        export: (row: GlobalUserDataAccessLog) =>
          row.accessor.full_name || row.accessor.username,
      },
      {
        title: translate('Accessor type'),
        render: ({ row }: { row: GlobalUserDataAccessLog }) => (
          <Badge
            variant={getAccessorTypeBadgeVariant(row.accessor_type)}
            pill
            outline
          >
            {getAccessorCategory(row.accessor_type)}
          </Badge>
        ),
        export: (row: GlobalUserDataAccessLog) =>
          getAccessorCategory(row.accessor_type),
      },
      {
        title: translate('IP address'),
        render: ({ row }: { row: GlobalUserDataAccessLog }) => (
          <code className="text-muted">
            {renderFieldOrDash(row.ip_address)}
          </code>
        ),
        export: (row: GlobalUserDataAccessLog) => row.ip_address || '',
      },
    ],
    [],
  );

  return (
    <Table<GlobalUserDataAccessLog>
      {...tableProps}
      columns={columns}
      filters={<SupportDataAccessLogsFilter />}
      verboseName={translate('Data access logs')}
      hasQuery
      enableExport
      showPageSizeSelector
      expandableRow={({ row }) => (
        <SupportDataAccessLogsExpandableRow row={row} />
      )}
      rowActions={({ row }) => (
        <DataAccessLogsRowActions row={row} refetch={tableProps.fetch} />
      )}
      enableMultiSelect
      multiSelectActions={DataAccessLogsBulkDeleteAction}
    />
  );
};
