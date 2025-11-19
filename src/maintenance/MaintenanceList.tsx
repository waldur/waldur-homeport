import { FC, useMemo } from 'react';
import {
  MaintenanceAnnouncement,
  maintenanceAnnouncementsList,
  ServiceProvider,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { MaintenanceRowActions } from './actions/MaintenanceRowActions';
import { MaintenanceAddButton } from './create/MaintenanceAddButton';
import { MaintenanceExpandableRow } from './MaintenanceExpandableRow';
import { MAINTENANCE_TYPE } from './types';
import { getMaintenanceState } from './utils';

interface MaintenanceListProps {
  provider?: ServiceProvider;
}

export const MaintenanceList: FC<MaintenanceListProps> = (props) => {
  const filter = useMemo(
    () => ({ service_provider_uuid: props.provider?.uuid }),
    [props.provider],
  );

  const tableProps = useTable({
    table: 'MaintenanceList',
    fetchData: createFetcher(maintenanceAnnouncementsList),
    queryField: 'name',
    filter,
  });

  const columns: Column<MaintenanceAnnouncement>[] = useMemo(
    () =>
      [
        {
          title: translate('Title'),
          render: ({ row }) => row.name,
        },
        !props.provider
          ? {
              title: translate('Service provider'),
              render: ({ row }) => row.service_provider_name,
            }
          : null,
        {
          title: translate('Affected offerings'),
          render: ({ row }) => row.affected_offerings.length,
        },
        {
          title: translate('Scheduled'),
          render: ({ row }) => (
            <>
              <span className="d-block text-nowrap">
                {formatDateTime(row.scheduled_start)}
              </span>
              <span className="d-block text-nowrap">
                {formatDateTime(row.scheduled_end)}
              </span>
            </>
          ),
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
          title: translate('Maintenance type'),
          render: ({ row }) => MAINTENANCE_TYPE[row.maintenance_type],
        },
      ].filter(Boolean),
    [props.provider],
  );

  return (
    <Table<MaintenanceAnnouncement>
      {...tableProps}
      columns={columns}
      showPageSizeSelector={true}
      verboseName={translate('Maintenance records')}
      hasQuery
      tableActions={
        props.provider ? (
          <MaintenanceAddButton
            provider={props.provider}
            refetch={tableProps.fetch}
          />
        ) : undefined
      }
      rowActions={({ row, fetch }) => (
        <MaintenanceRowActions
          provider={props.provider}
          row={row}
          fetch={fetch}
        />
      )}
      expandableRow={MaintenanceExpandableRow}
    />
  );
};
