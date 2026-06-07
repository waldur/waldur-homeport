import { useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { dataAccessLogsList, GlobalUserDataAccessLog } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  DataAccessLogsFilter as SupportDataAccessLogsFilter,
  selectDataAccessLogsFilter as selectSupportDataAccessLogsFilter,
  DataAccessLogsFilterFormId,
} from '@/table/generated/DataAccessLogsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import {
  getAccessorCategory,
  getAccessorTypeBadgeVariant,
} from '@/user/data-access/utils';

import { DataAccessLogsBulkDeleteAction } from './DataAccessLogsBulkDeleteAction';
import { DataAccessLogsRowActions } from './DataAccessLogsRowActions';
import { SupportDataAccessLogsExpandableRow } from './SupportDataAccessLogsExpandableRow';

const SupportDataAccessLogsListTable = () => {
  const { values } = useFormState();

  const filterValues = useMemo(
    () => selectSupportDataAccessLogsFilter(values),
    [values],
  );

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
            state="support-user-manage"
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
            state="support-user-manage"
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
      formId={DataAccessLogsFilterFormId}
    />
  );
};

export const SupportDataAccessLogsList = (props) => (
  <Form
    id={DataAccessLogsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <SupportDataAccessLogsListTable {...props} />}
  </Form>
);
