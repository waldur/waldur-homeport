import { FunctionComponent, useMemo } from 'react';
import {
  OpenStackVolume,
  openstackVolumesList,
  OpenstackVolumesListData,
} from 'waldur-js-client';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { ModalActionsRouter } from '@/marketplace/resources/actions/ModalActionsRouter';
import { ResourceName } from '@/resource/ResourceName';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { VOLUME_TYPE } from '../constants';
import { AttachVolumeAction } from '../openstack-instance/actions/AttachVolumeAction';

export const InstanceVolumesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackVolumesListData['query'] => ({
      instance_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-volumes',
    fetchData: createFetcher(openstackVolumesList),
    filter,
  });

  return (
    <Table<OpenStackVolume>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
          copyField: (row) => row.name,
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
          render: ({ row }) => renderFieldOrDash(row.type_name),
        },
        {
          title: translate('Attached to'),
          render: ({ row }) => renderFieldOrDash(row.device),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      tableActions={
        <AttachVolumeAction resource={resourceScope} refetch={props.fetch} />
      }
      title={translate('Volumes')}
      verboseName={translate('volumes')}
      showPageSizeSelector
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
