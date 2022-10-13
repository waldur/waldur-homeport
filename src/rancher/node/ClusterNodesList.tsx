import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { CreateNodeAction } from '../cluster/actions/CreateNodeAction';

import { NodeRoleField } from './NodeRoleField';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Node'),
          render: ({ row }) => <ResourceName resource={row} />,
        },
        {
          title: translate('Roles'),
          render: ({ row }) => <NodeRoleField node={row} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Instance'),
          render: ({ row }) => {
            if (!row.instance_uuid) {
              return translate('Not assigned');
            }
            return (
              <Link
                state="resource-details"
                params={{
                  uuid: row.project_uuid,
                  resource_uuid: row.instance_uuid,
                  resource_type: INSTANCE_TYPE,
                }}
                label={row.instance_name}
              />
            );
          },
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <ResourceRowActions resource={row} />,
        },
      ]}
      verboseName={translate('Kubernetes nodes')}
      actions={<CreateNodeAction resource={props.resource} />}
    />
  );
};

const TableOptions = {
  table: 'rancher-nodes',
  fetchData: createFetcher('rancher-nodes'),
  mapPropsToFilter: (props) => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterNodesList = connectTable(TableOptions)(TableComponent);
