import * as React from 'react';

import { NestedListActions } from '@waldur/resource/actions/NestedListActions';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
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
      actions={
        <NestedListActions resource={props.resource} tab="security_groups" />
      }
    />
  );
};

const TableOptions = {
  table: 'openstack-security-groups',
  fetchData: createFetcher('openstack-security-groups'),
  mapPropsToFilter: props => ({
    tenant_uuid: props.resource.uuid,
  }),
};

export const SecurityGroupsList = connectTable(TableOptions)(TableComponent);
