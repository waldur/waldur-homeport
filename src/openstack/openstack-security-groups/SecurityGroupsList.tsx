import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CreateSecurityGroupAction } from '../openstack-tenant/actions/CreateSecurityGroupAction';
import { PullSecurityGroupsAction } from '../openstack-tenant/actions/PullSecurityGroupsAction';

import { SecurityGroupExpandableRow } from './SecurityGroupExpandableRow';

export const SecurityGroupsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      tenant_uuid: resourceScope.uuid,
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
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-security-groups',
    fetchData: createFetcher('openstack-security-groups'),
    filter,
    queryField: 'query',
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
          export: 'name',
        },
        {
          visible: false,
          title: translate('Security groups'),
          render: null,
          export: (row) =>
            row.rules.map((rule) => {
              return JSON.stringify(rule).replaceAll(/"/g, "'");
            }),
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
