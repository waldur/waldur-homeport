import { FC, useMemo } from 'react';
import { OpenStackNetwork } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceDeleteButton } from '@waldur/resource/actions/ResourceDeleteButton';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { deleteNetworkRBAC } from '../api';

const POLICY_TYPE = {
  access_as_shared: { color: 'blue', label: translate('Shared') },
  access_as_external: { color: 'warning', label: translate('External') },
};

const RowActions: FC<{ row; networkUuid; fetch }> = ({
  row,
  networkUuid,
  fetch,
}) => {
  return (
    <ActionsDropdownComponent>
      <ResourceDeleteButton
        apiFunction={() =>
          deleteNetworkRBAC({ network_uuid: networkUuid, uuid: row.uuid })
        }
        resourceType={translate('Network sharing')}
        refetch={fetch}
      />
    </ActionsDropdownComponent>
  );
};

export const NetworkRBACList: FC<{ network: OpenStackNetwork }> = ({
  network,
}) => {
  const filter = useMemo(() => ({ network_uuid: network.uuid }), [network]);
  const props = useTable({
    table: 'openstack-network-rbac-' + network.uuid,
    fetchData: createFetcher('openstack-network-rbac-policies'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Tenant'),
          render: ({ row }) => <>{row.target_tenant_name}</>,
        },
        {
          title: translate('Policy type'),
          render: ({ row }) => (
            <Badge
              variant={POLICY_TYPE[row.policy_type]?.color || 'default'}
              pill
              outline
            >
              {POLICY_TYPE[row.policy_type]?.label || row.policy_type}
            </Badge>
          ),
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
        },
      ]}
      verboseName={translate('Network sharing')}
      hasActionBar={false}
      rowActions={({ row, fetch }) => (
        <RowActions row={row} fetch={fetch} networkUuid={network.uuid} />
      )}
      initialPageSize={5}
      minHeight={265}
    />
  );
};
