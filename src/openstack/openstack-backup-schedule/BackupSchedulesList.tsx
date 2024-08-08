import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { formatCrontab } from '@waldur/resource/crontab';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, createFetcher } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { useTable } from '@waldur/table/utils';

import { CreateBackupScheduleAction } from '../openstack-instance/actions/CreateBackupScheduleAction';

export const BackupsSchedulesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      instance: resourceScope.url,
    }),
    [resourceScope],
  );

  const props = useTable({
    table: 'openstacktenant-backup-schedules',
    fetchData: createFetcher('openstacktenant-backup-schedules'),
    filter,
  });

  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
          orderField: 'name',
        },
        {
          title: translate('Max number of VM snapshots'),
          render: ({ row }) => row.maximal_number_of_resources || 'N/A',
        },
        {
          title: translate('Schedule'),
          render: ({ row }) => formatCrontab(row.schedule),
        },
        {
          title: translate('Is active'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <ResourceRowActions resource={row} refetch={props.fetch} />
          ),
        },
      ]}
      verboseName={translate('VM snapshot schedules')}
      hasQuery={false}
      tableActions={<CreateBackupScheduleAction resource={resourceScope} />}
    />
  );
};
