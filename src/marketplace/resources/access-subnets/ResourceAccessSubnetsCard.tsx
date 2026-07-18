import { FunctionComponent, useMemo } from 'react';
import { Card, Table as BsTable } from 'react-bootstrap';
import {
  Offering,
  Resource,
  ResourceAccessSubnet,
  marketplaceResourceAccessSubnetsList,
} from 'waldur-js-client';

import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { ResourceAccessSubnetCreateButton } from './ResourceAccessSubnetCreateButton';
import { ResourceAccessSubnetRowActions } from './ResourceAccessSubnetRowActions';

interface ResourceAccessSubnetsCardProps {
  resource: Resource;
  offering?: Offering;
}

export const ResourceAccessSubnetsCard: FunctionComponent<
  ResourceAccessSubnetsCardProps
> = ({ resource, offering }) => {
  const defaults = offering?.default_access_subnets ?? [];
  const resource_uuid = resource.uuid;
  const filter = useMemo(() => ({ resource_uuid }), [resource_uuid]);
  const tableProps = useTable({
    table: 'resourceAccessSubnets',
    filter,
    fetchData: createFetcher(marketplaceResourceAccessSubnetsList),
    queryField: 'description',
  });

  const user = useUser();
  const canManage = hasPermission(user, {
    permission: PermissionEnum.UPDATE_RESOURCE,
    projectId: resource.project_uuid,
    customerId: resource.customer_uuid,
  });

  return (
    <>
      {defaults.length > 0 && (
        <Card className="card-bordered mb-5">
          <Card.Header>
            <Card.Title className="h5">
              {translate('Default allowed (from provider)')}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <BsTable bordered={true} hover={true} responsive={true}>
              <thead>
                <tr>
                  <th>{translate('CIDR')}</th>
                  <th>{translate('Description')}</th>
                </tr>
              </thead>
              <tbody>
                {defaults.map((row) => (
                  <tr key={row.uuid}>
                    <td>{row.inet}</td>
                    <td>{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </BsTable>
          </Card.Body>
        </Card>
      )}

      <Table<ResourceAccessSubnet>
        {...tableProps}
        id="resource-access-subnets"
        title={translate('Access subnets')}
        columns={[
          {
            title: translate('CIDR'),
            render: ({ row }) => <>{row.inet}</>,
          },
          {
            title: translate('Description'),
            render: ({ row }) => <>{row.description}</>,
          },
        ]}
        verboseName={translate('Access subnets')}
        hasQuery
        tableActions={
          <>
            <FilteredEventsButton
              filter={{ scope: resource.url, feature: ['access_subnets'] }}
            />

            {canManage && (
              <ResourceAccessSubnetCreateButton
                refetch={tableProps.fetch}
                resource_url={resource.url}
              />
            )}
          </>
        }
        rowActions={
          canManage
            ? ({ row }) => (
                <ResourceAccessSubnetRowActions
                  row={row}
                  refetch={tableProps.fetch}
                />
              )
            : undefined
        }
      />
    </>
  );
};
