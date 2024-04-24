import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CreatePortAction } from './actions/CreatePortAction';

export const PortsList: FunctionComponent<{ resource }> = ({ resource }) => {
  const filter = useMemo(
    () => ({
      vm_uuid: resource.uuid,
    }),
    [resource],
  );

  const props = useTable({
    table: 'vmware-ports',
    fetchData: createFetcher('vmware-ports'),
    filter,
  });

  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
        },
        {
          title: translate('Network'),
          render: ({ row }) => row.network_name || 'N/A',
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => row.mac_address || 'N/A',
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('ports')}
      actions={<CreatePortAction resource={resource} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hoverableRow={({ row }) => (
        <ActionButtonResource url={row.url} refetch={props.fetch} />
      )}
    />
  );
};
