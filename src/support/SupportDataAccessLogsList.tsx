import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  dataAccessLogsList,
  DataAccessLogsListData,
  GlobalUserDataAccessLog,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import {
  getAccessorCategory,
  getAccessorTypeBadgeVariant,
} from '@waldur/user/data-access/utils';

import { DataAccessLogsBulkDeleteAction } from './DataAccessLogsBulkDeleteAction';
import { DataAccessLogsRowActions } from './DataAccessLogsRowActions';
import { SupportDataAccessLogsExpandableRow } from './SupportDataAccessLogsExpandableRow';
import { SupportDataAccessLogsFilter } from './SupportDataAccessLogsFilter';

const mapStateToFilter = createSelector(
  getFormValues('SupportDataAccessLogsFilter'),
  (filterValues: any) => {
    const result: DataAccessLogsListData['query'] = {};
    if (filterValues?.start_date) {
      result.start_date = filterValues.start_date;
    }
    if (filterValues?.end_date) {
      result.end_date = filterValues.end_date;
    }
    if (filterValues?.accessor_type?.value) {
      result.accessor_type = filterValues.accessor_type.value;
    }
    if (filterValues?.user?.uuid) {
      result.user_uuid = filterValues.user.uuid;
    }
    return result;
  },
);

export const SupportDataAccessLogsList = () => {
  const filterValues = useSelector(mapStateToFilter);

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
          <code className="text-muted">{row.ip_address || '—'}</code>
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
