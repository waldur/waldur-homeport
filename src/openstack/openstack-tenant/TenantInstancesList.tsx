import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { AddResourceButton } from '@waldur/marketplace/resources/actions/AddResourceButton';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { IPList } from '@waldur/resource/IPList';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { ResourceSummaryField } from '@waldur/resource/summary/VirtualMachineSummary';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { INSTANCE_TYPE } from '../constants';

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
          title: translate('Summary'),
          render: ({ row }) => <ResourceSummaryField resource={row} />,
        },
        {
          title: translate('Internal IPs'),
          render: ({ row }) => <IPList value={row.internal_ips} />,
        },
        {
          title: translate('External IPs'),
          render: ({ row }) => <IPList value={row.external_ips} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('instances')}
      actions={
        <AddResourceButton
          resource={props.resource}
          offeringType={INSTANCE_TYPE}
        />
      }
      hoverableRow={({ row }) => (
        <ActionButtonResource url={row.url} refetch={props.fetch} />
      )}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hasQuery={true}
      showPageSizeSelector={true}
    />
  );
};

const TableOptions = {
  table: 'openstacktenant-instances',
  fetchData: createFetcher('openstacktenant-instances'),
  mapPropsToFilter: (props) => ({
    service_settings_uuid: props.resource.child_settings,
    field: [
      'uuid',
      'url',
      'name',
      'description',
      'created',
      'internal_ips',
      'external_ips',
      'state',
      'runtime_state',
      'resource_type',
      'error_message',
      'image_name',
      'flavor_name',
      'cores',
      'ram',
      'start_time',
      'resource_state',
      'volumes',
      'security_groups',
      'backend_id',
      'marketplace_resource_uuid',
      'key_name',
      'project_uuid',
    ],
  }),
  queryField: 'name',
};

export const TenantInstancesList = connectTable(TableOptions)(TableComponent);
