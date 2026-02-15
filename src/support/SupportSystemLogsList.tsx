import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  overrideSettingsRetrieve,
  systemLogsList,
  SystemLogsListData,
  SystemLog,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { SupportSystemLogsExpandableRow } from './SupportSystemLogsExpandableRow';
import { SupportSystemLogsFilter } from './SupportSystemLogsFilter';

type BadgeVariant = 'danger' | 'warning' | 'info' | 'secondary';

const getLevelBadgeVariant = (level: string): BadgeVariant => {
  switch (level) {
    case 'CRITICAL':
    case 'ERROR':
      return 'danger';
    case 'WARNING':
      return 'warning';
    case 'INFO':
      return 'info';
    default:
      return 'secondary';
  }
};

const mapStateToFilter = createSelector(
  getFormValues('SupportSystemLogsFilter'),
  (filterValues: any) => {
    const result: SystemLogsListData['query'] = {};
    if (filterValues?.source?.value) {
      result.source = filterValues.source.value;
    }
    if (filterValues?.level?.value) {
      result.level = filterValues.level.value;
    }
    if (filterValues?.instance) {
      result.instance = filterValues.instance;
    }
    if (filterValues?.logger_name) {
      result.logger_name = filterValues.logger_name;
    }
    if (filterValues?.start_date) {
      result.created_from = DateTime.fromISO(filterValues.start_date)
        .startOf('day')
        .toSeconds();
    }
    if (filterValues?.end_date) {
      result.created_to = DateTime.fromISO(filterValues.end_date)
        .endOf('day')
        .toSeconds();
    }
    return result;
  },
);

export const SupportSystemLogsList = () => {
  const { data: settings } = useQuery({
    queryKey: ['SystemLogSettings'],
    queryFn: () => overrideSettingsRetrieve().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const isEnabled = settings?.SYSTEM_LOG_ENABLED ?? true;

  const filterValues = useSelector(mapStateToFilter);

  const filter = useMemo(
    () => ({
      ...filterValues,
    }),
    [filterValues],
  );

  const tableProps = useTable({
    table: 'SupportSystemLogsList',
    fetchData: createFetcher(systemLogsList),
    filter,
    queryField: 'message',
  });

  const columns = useMemo(
    () => [
      {
        title: translate('Timestamp'),
        orderField: 'created',
        render: ({ row }: { row: SystemLog }) => (
          <>{formatDateTime(row.created)}</>
        ),
        export: (row: SystemLog) => formatDateTime(row.created),
      },
      {
        title: translate('Source'),
        render: ({ row }: { row: SystemLog }) => (
          <Badge variant="secondary" pill outline>
            {row.source}
          </Badge>
        ),
        export: (row: SystemLog) => row.source,
      },
      {
        title: translate('Instance'),
        orderField: 'instance',
        render: ({ row }: { row: SystemLog }) => <>{row.instance}</>,
        export: (row: SystemLog) => row.instance,
      },
      {
        title: translate('Level'),
        orderField: 'level_number',
        render: ({ row }: { row: SystemLog }) => (
          <Badge variant={getLevelBadgeVariant(row.level)} pill outline>
            {row.level}
          </Badge>
        ),
        export: (row: SystemLog) => row.level,
      },
      {
        title: translate('Logger'),
        render: ({ row }: { row: SystemLog }) => <>{row.logger_name}</>,
        export: (row: SystemLog) => row.logger_name,
      },
      {
        title: translate('Message'),
        render: ({ row }: { row: SystemLog }) => (
          <span title={row.message}>{truncate(row.message, 80)}</span>
        ),
        export: (row: SystemLog) => row.message,
      },
    ],
    [],
  );

  return (
    <Table<SystemLog>
      {...tableProps}
      columns={columns}
      filters={<SupportSystemLogsFilter />}
      title={
        <>
          {translate('System logs')}{' '}
          <Link
            state="admin-system-logging-settings"
            className="text-decoration-none"
          >
            <Badge variant={isEnabled ? 'success' : 'warning'} pill outline>
              {isEnabled
                ? translate('Collection enabled')
                : translate('Collection disabled')}
            </Badge>
          </Link>
        </>
      }
      hasQuery
      enableExport
      showPageSizeSelector
      expandableRow={({ row }) => <SupportSystemLogsExpandableRow row={row} />}
    />
  );
};
