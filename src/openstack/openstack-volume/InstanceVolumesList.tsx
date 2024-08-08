import { FunctionComponent, useMemo } from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ModalActionsRouter } from '@waldur/marketplace/resources/actions/ModalActionsRouter';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, createFetcher } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { useTable } from '@waldur/table/utils';

import { VOLUME_TYPE } from '../constants';
import { AttachVolumeAction } from '../openstack-instance/actions/AttachVolumeAction';

export const InstanceVolumesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      instance_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstacktenant-volumes',
    fetchData: createFetcher('openstacktenant-volumes'),
    filter,
  });

  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
        },
        {
          title: translate('Size'),
          render: ({ row }) => formatFilesize(row.size),
        },
        {
          title: translate('Bootable'),
          render: ({ row }) => <BooleanField value={row.bootable} />,
        },
        {
          title: translate('Type'),
          render: ({ row }) => row.type_name || 'N/A',
        },
        {
          title: translate('Attached to'),
          render: ({ row }) => row.device || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      tableActions={<AttachVolumeAction resource={resourceScope} />}
      verboseName={translate('volumes')}
      rowActions={({ row }) => (
        <ModalActionsRouter
          url={row.url}
          name={row.name}
          offering_type={VOLUME_TYPE}
          refetch={props.fetch}
        />
      )}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
    />
  );
};
