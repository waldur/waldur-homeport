import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { INSTANCE_TYPE } from '../constants';
import { CreateFloatingIpAction } from '../openstack-tenant/actions/CreateFloatingIpAction';
import { PullFloatingIpsAction } from '../openstack-tenant/actions/PullFloatingIpsAction';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Floating IP'),
          render: ({ row }) => <>{row.name}</>,
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
      verboseName={translate('floating IPs')}
      actions={
        <ButtonGroup>
          <PullFloatingIpsAction resource={props.resource} />
          <CreateFloatingIpAction resource={props.resource} />
        </ButtonGroup>
      }
      hoverableRow={({ row }) => <ActionButtonResource url={row.url} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
    />
  );
};

const TableOptions = {
  table: 'openstack-floating-ips',
  fetchData: createFetcher('openstack-floating-ips'),
  mapPropsToFilter: (props) => ({
    tenant_uuid: props.resource.uuid,
  }),
};

export const FloatingIpsList = connectTable(TableOptions)(TableComponent);
