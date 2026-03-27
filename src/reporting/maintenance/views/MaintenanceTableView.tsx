import { FC, useMemo } from 'react';
import { MaintenanceAnnouncement } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getMaintenanceState } from '@waldur/maintenance/utils';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { MaintenanceReportingExpandableRow } from '../MaintenanceReportingExpandableRow';
import {
  getMaxImpactLevel,
  IMPACT_LABELS,
  MAINTENANCE_TYPE_LABELS,
} from '../utils';

interface MaintenanceTableViewProps {
  announcements: MaintenanceAnnouncement[];
}

export const MaintenanceTableView: FC<MaintenanceTableViewProps> = ({
  announcements,
}) => {
  const tableProps = useTable({
    table: 'MaintenanceReportingTable',
    fetchData: () =>
      Promise.resolve({
        rows: announcements,
      }),
  });

  // Refetch when data changes
  useMemo(() => {
    tableProps.fetch();
  }, [announcements]);

  const columns: Column<MaintenanceAnnouncement>[] = useMemo(
    () => [
      {
        title: translate('Title'),
        render: ({ row }) => row.name,
      },
      {
        title: translate('Provider'),
        render: ({ row }) => row.service_provider_name,
      },
      {
        title: translate('Offerings'),
        render: ({ row }) => (
          <span className="text-muted">
            {row.affected_offerings.length} {translate('offerings')}
          </span>
        ),
      },
      {
        title: translate('Scheduled'),
        render: ({ row }) => (
          <>
            <span className="d-block text-nowrap">
              {formatDateTime(row.scheduled_start)}
            </span>
            <span className="d-block text-nowrap text-muted">
              {formatDateTime(row.scheduled_end)}
            </span>
          </>
        ),
      },
      {
        title: translate('Actual'),
        render: ({ row }) => {
          if (!row.actual_start && !row.actual_end) {
            return <span className="text-muted">{DASH_ESCAPE_CODE}</span>;
          }
          return (
            <>
              <span className="d-block text-nowrap">
                {row.actual_start
                  ? formatDateTime(row.actual_start)
                  : DASH_ESCAPE_CODE}
              </span>
              <span className="d-block text-nowrap text-muted">
                {row.actual_end
                  ? formatDateTime(row.actual_end)
                  : DASH_ESCAPE_CODE}
              </span>
            </>
          );
        },
      },
      {
        title: translate('State'),
        render: ({ row }) => {
          const state = getMaintenanceState(row.state);
          return (
            <Badge variant={state.color} size="sm" pill outline>
              {state.label}
            </Badge>
          );
        },
      },
      {
        title: translate('Type'),
        render: ({ row }) =>
          renderFieldOrDash(MAINTENANCE_TYPE_LABELS[row.maintenance_type || 1]),
      },
      {
        title: translate('Max impact'),
        render: ({ row }) => {
          const maxImpact = getMaxImpactLevel(row);
          return renderFieldOrDash(IMPACT_LABELS[maxImpact]);
        },
      },
    ],
    [],
  );

  return (
    <Table<MaintenanceAnnouncement>
      {...tableProps}
      columns={columns}
      showPageSizeSelector
      verboseName={translate('Maintenance records')}
      hasQuery
      expandableRow={MaintenanceReportingExpandableRow}
    />
  );
};
