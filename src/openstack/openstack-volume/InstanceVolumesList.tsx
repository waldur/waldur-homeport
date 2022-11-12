import { FunctionComponent } from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';

import { AttachVolumeAction } from '../openstack-instance/actions/AttachVolumeAction';

const TableComponent: FunctionComponent<any> = (props) => {
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
      actions={<AttachVolumeAction resource={props.resource} />}
      verboseName={translate('volumes')}
      hoverableRow={({ row }) => <ActionButtonResource url={row.url} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
    />
  );
};

const TableOptions = {
  table: 'openstacktenant-volumes',
  fetchData: createFetcher('openstacktenant-volumes'),
  mapPropsToFilter: (props) => ({
    instance_uuid: props.resource.uuid,
  }),
};

export const InstanceVolumesList = connectTable(TableOptions)(TableComponent);
