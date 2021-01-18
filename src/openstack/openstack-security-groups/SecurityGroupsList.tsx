import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Resource } from '@waldur/resource/types';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { CreateSecurityGroupAction } from '../openstack-tenant/actions/CreateSecurityGroupAction';
import { PullSecurityGroupsAction } from '../openstack-tenant/actions/PullSecurityGroupsAction';
import { SecurityGroupRule } from '../types';

interface ResourceRules extends Resource {
  rules: SecurityGroupRule[];
}

const ResourceRuleCount = (resource: ResourceRules) => resource.rules.length;

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
          orderField: 'name',
        },
        {
          title: translate('Rule count'),
          render: ({ row }) => ResourceRuleCount(row),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
          className: 'col-sm-2',
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <ResourceRowActions resource={row} />,
          className: 'col-sm-2',
        },
      ]}
      verboseName={translate('security groups')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      showPageSizeSelector={true}
      actions={
        <ButtonGroup>
          <CreateSecurityGroupAction resource={props.resource} />
          <PullSecurityGroupsAction resource={props.resource} />
        </ButtonGroup>
      }
    />
  );
};

const TableOptions = {
  table: 'openstack-security-groups',
  fetchData: createFetcher('openstack-security-groups'),
  mapPropsToFilter: (props) => ({
    tenant_uuid: props.resource.uuid,
  }),
};

export const SecurityGroupsList = connectTable(TableOptions)(TableComponent);
