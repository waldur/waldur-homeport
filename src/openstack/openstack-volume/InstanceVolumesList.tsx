import { FunctionComponent, useMemo } from 'react';
import {
  OpenStackVolume,
  openstackVolumesList,
  OpenstackVolumesListData,
} from 'waldur-js-client';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ModalActionsRouter } from '@waldur/marketplace/resources/actions/ModalActionsRouter';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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
