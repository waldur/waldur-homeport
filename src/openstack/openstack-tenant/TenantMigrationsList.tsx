import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ExecuteMigrationAction } from './actions/ExecuteMigrationAction';
import { CreateMigrationButton } from './CreateMigrationButton';
import { MigrationExpandableRow } from './MigrationExpandableRow';

export const TenantMigrationsList: FunctionComponent<{ resource }> = ({
  resource,
}) => {
  const filter = useMemo(
    () => ({
      src_resource_uuid: resource.uuid,
    }),
    [resource],
  );
  const props = useTable({
    table: 'openstack-migrations',
    fetchData: createFetcher('openstack-migrations'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Destination resource'),
          render: ({ row }) => (
            <ResourceLink
              uuid={row.dst_resource_uuid}
              label={row.dst_resource_name}
            />
          ),
        },
        {
          title: translate('Destination offering'),
          render: ({ row }) => row.dst_offering_name,
        },
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
        },
      ]}
      verboseName={translate('migrations')}
      rowActions={({ row }) => (
        <ExecuteMigrationAction resource={row} refetch={props.fetch} />
      )}
      tableActions={
        <CreateMigrationButton resource={resource} refetch={props.fetch} />
      }
      expandableRow={MigrationExpandableRow}
    />
  );
};
