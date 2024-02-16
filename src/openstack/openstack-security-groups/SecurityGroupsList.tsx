import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { CreateSecurityGroupAction } from '../openstack-tenant/actions/CreateSecurityGroupAction';
import { PullSecurityGroupsAction } from '../openstack-tenant/actions/PullSecurityGroupsAction';

import { SecurityGroupExpandableRow } from './SecurityGroupExpandableRow';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
          className: 'col-sm-2',
        },
      ]}
      expandableRow={SecurityGroupExpandableRow}
      enableExport={true}
      hoverableRow={({ row }) => (
        <ActionButtonResource url={row.url} refetch={props.fetch} />
      )}
      verboseName={translate('security groups')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      showPageSizeSelector={true}
      hasQuery={true}
      actions={
        <ButtonGroup>
          <CreateSecurityGroupAction resource={props.resource} />
          <PullSecurityGroupsAction resource={props.resource} />
        </ButtonGroup>
      }
    />
  );
};

const exportRow = (row) => [
  row.name,
  row.rules.map((rule) => {
    return JSON.stringify(rule).replaceAll(/"/g, "'");
  }),
];

const TableOptions = {
  table: 'openstack-security-groups',
  fetchData: createFetcher('openstack-security-groups'),
  mapPropsToFilter: (props) => ({
    tenant_uuid: props.resource.uuid,
    field: [
      'name',
      'description',
      'state',
      'url',
      'marketplace_offering_uuid',
      'service_name',
      'end_date',
      'backend_id',
      'rules',
      'resource_type',
    ],
  }),
  queryField: 'query',
  exportRow,
  exportFields: ['Name', 'Security groups'],
};

export const SecurityGroupsList = connectTable(TableOptions)(TableComponent);
