import { FunctionComponent, useMemo } from 'react';
import { OpenStackBackup, openstackBackupsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ResourceRowActions } from '@/resource/actions/ResourceRowActions';
import { ResourceName } from '@/resource/ResourceName';
import { ResourceState } from '@/resource/state/ResourceState';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { INSTANCE_TYPE } from '../constants';
import { CreateBackupAction } from '../openstack-instance/actions/CreateBackupAction';

export const BackupsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(() => {
    const fields = {
      [INSTANCE_TYPE]: 'instance',
    };
    const { resource_type, url } = resourceScope;
    const field = fields[resource_type];
    if (field) {
      return {
        [field]: url,
      };
    }
  }, [resourceScope]);
  const props = useTable({
    table: 'openstack-backups',
    fetchData: createFetcher(openstackBackupsList),
    filter,
  });
  return (
    <Table<OpenStackBackup>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
          copyField: (row) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
        {
          title: translate('Keep until'),
          render: ({ row }) =>
            row.kept_until
              ? formatDateTime(row.kept_until)
              : translate('Keep forever'),
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
      title={translate('VM snapshots')}
      verboseName={translate('VM snapshots')}
      hasQuery={false}
      showPageSizeSelector
      tableActions={<CreateBackupAction resource={resourceScope} />}
    />
  );
};
