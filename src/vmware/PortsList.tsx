import { FunctionComponent, useMemo } from 'react';
import { vmwarePortsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ActionButtonResource } from '@/resource/actions/ActionButtonResource';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CreatePortAction } from './actions/CreatePortAction';

export const PortsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      vm_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );

  const props = useTable({
    table: 'vmware-ports',
    fetchData: createFetcher(vmwarePortsList),
    filter,
  });

  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Network'),
          render: ({ row }) => renderFieldOrDash(row.network_name),
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => renderFieldOrDash(row.mac_address),
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
      showPageSizeSelector
      tableActions={<CreatePortAction resource={resourceScope} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      rowActions={({ row }) => (
        <ActionButtonResource url={row.url} refetch={props.fetch} />
      )}
    />
  );
};
