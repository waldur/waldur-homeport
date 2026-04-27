import { FunctionComponent, useMemo } from 'react';
import {
  OpenStackSnapshot,
  openstackSnapshotsList,
  OpenstackSnapshotsListData,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { ResourceRowActions } from '@/resource/actions/ResourceRowActions';
import { ResourceName } from '@/resource/ResourceName';
import { ResourceState } from '@/resource/state/ResourceState';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const TenantSnapshotsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackSnapshotsListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
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
      title={translate('Snapshots')}
      verboseName={translate('snapshots')}
      hasQuery={false}
      showPageSizeSelector
    />
  );
};
