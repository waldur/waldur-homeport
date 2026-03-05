import { FunctionComponent, useMemo } from 'react';
import { OpenStackSnapshot, openstackSnapshotsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { CreateSnapshotAction } from './actions/CreateSnapshotAction';

export const VolumeSnapshotsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      source_volume_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );

  const props = useTable({
    table: 'openstack-snapshots',
    fetchData: createFetcher(openstackSnapshotsList),
    filter,
  });

  return (
    <Table<OpenStackSnapshot>
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
          title: translate('Size'),
          render: ({ row }) => formatFilesize(row.size),
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
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <ResourceRowActions resource={row} refetch={props.fetch} />
          ),
        },
      ]}
      verboseName={translate('snapshots')}
      hasQuery={false}
      showPageSizeSelector
      tableActions={
        <CreateSnapshotAction resource={resourceScope} refetch={props.fetch} />
      }
    />
  );
};
