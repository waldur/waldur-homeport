import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
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
          render: ({ row }) => <>{row.name}</>,
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
      ]}
      verboseName={translate('Kubernetes nodes')}
      actions={<CreateNodeAction resource={props.resource} />}
      hoverableRow={({ row }) => <ActionButtonResource url={row.url} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
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
