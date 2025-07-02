import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import {
  OpenStackSecurityGroup,
  OpenstackSecurityGroupsListData,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { CreateSecurityGroupAction } from '../openstack-tenant/actions/CreateSecurityGroupAction';
import { PullSecurityGroupsAction } from '../openstack-tenant/actions/PullSecurityGroupsAction';

import { DestroyBulkSecurityGroupsAction } from './DestroyBulkSecurityGroupsAction';
import { SecurityGroupRulesList } from './SecurityGroupRulesList';

export const SecurityGroupsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackSecurityGroupsListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      field: [
        'uuid',
        'name',
        'description',
        'state',
        'url',
        'marketplace_offering_uuid',
        'service_name',
        'backend_id',
        'rules',
        'resource_type',
      ],
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-security-groups',
    fetchData: createFetcher('openstack-security-groups'),
    filter,
    queryField: 'query',
  });
  return (
    <Table<OpenStackSecurityGroup>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
          orderField: 'name',
          export: 'name',
        },
        {
          visible: false,
          title: translate('Security groups'),
          render: null,
          export: (row) =>
            row.rules
              .map((rule) => {
                return JSON.stringify(rule).replaceAll(/"/g, "'");
              })
              .join(','),
          exportKeys: ['rules'],
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description,
          export: false,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
          className: 'col-sm-2',
          export: false,
        },
      ]}
      title={translate('Security groups')}
      expandableRow={SecurityGroupRulesList}
      enableExport={true}
      rowActions={({ row }) => (
        <ActionButtonResource url={row.url} refetch={props.fetch} />
      )}
      multiSelectActions={DestroyBulkSecurityGroupsAction}
      enableMultiSelect
      verboseName={translate('security groups')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      showPageSizeSelector={true}
      hasQuery={true}
      tableActions={
        <ButtonGroup>
          <CreateSecurityGroupAction
            resource={resourceScope}
            refetch={props.fetch}
          />

          <PullSecurityGroupsAction resource={resourceScope} />
        </ButtonGroup>
      }
    />
  );
};
