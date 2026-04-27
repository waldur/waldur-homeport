import { FC, useMemo } from 'react';
import {
  OpenStackNetwork,
  openstackNetworkRbacPoliciesDestroy,
  openstackNetworkRbacPoliciesList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ResourceDeleteButton } from '@/resource/actions/ResourceDeleteButton';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

const POLICY_TYPE = {
  access_as_shared: { color: 'blue', label: translate('Shared') },
  access_as_external: { color: 'warning', label: translate('External') },
};

const RowActions: FC<{ row; fetch }> = ({ row, fetch }) => {
  return (
    <ActionsDropdownComponent>
      <ResourceDeleteButton
        apiFunction={() =>
          openstackNetworkRbacPoliciesDestroy({
            path: { uuid: row.uuid },
          })
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
    fetchData: createFetcher(openstackNetworkRbacPoliciesList),
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
      rowActions={RowActions}
      initialPageSize={5}
      minHeight={265}
    />
  );
};
