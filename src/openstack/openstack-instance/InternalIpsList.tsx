import { FunctionComponent, useCallback } from 'react';
import {
  OpenStackInstance,
  openstackInstancesRetrieve,
} from 'waldur-js-client';
import { OpenStackNestedPort } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { UpdateInternalIpsAction } from './actions/update-internal-ips/UpdateInternalIpsSetAction';
import { SetAllowedAddressPairsAction } from './SetAllowedAddressPairsAction';
import { formatAddressList } from './utils';

const RowActions = ({
  row,
  instance,
  refetch,
}: {
  row: OpenStackNestedPort;
  instance: OpenStackInstance;
  refetch: () => void;
}) => (
  <ActionsDropdownComponent>
    <SetAllowedAddressPairsAction
      resource={row}
      instance={instance}
      refetch={refetch}
    />
  </ActionsDropdownComponent>
);

export const InternalIpsList: FunctionComponent<{
  resourceScope: OpenStackInstance;
  refetch: () => void;
}> = ({ resourceScope, refetch }) => {
  const fetchData = useCallback(
    () =>
      openstackInstancesRetrieve({ path: { uuid: resourceScope.uuid } }).then(
        (vm) => ({
          rows: vm.data.ports,
          resultCount: vm.data.ports.length,
        }),
      ),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-internal-ips',
    fetchData,
  });
  return (
    <Table<OpenStackNestedPort>
      {...props}
      columns={[
        {
          title: translate('IP address'),
          render: ({ row }) => <>{formatAddressList(row)}</>,
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => <>{row.mac_address}</>,
        },
        {
          title: translate('Subnet name'),
          render: ({ row }) => <>{row.subnet_name}</>,
        },
        {
          title: translate('Subnet CIDR'),
          render: ({ row }) => <>{row.subnet_cidr}</>,
        },
      ]}
      title={translate('Ports')}
      verboseName={translate('ports')}
      showPageSizeSelector
      rowActions={({ row }) => (
        <RowActions
          row={row}
          instance={resourceScope}
          refetch={() => {
            refetch();
            props.fetch();
          }}
        />
      )}
      tableActions={
        <UpdateInternalIpsAction
          resource={resourceScope}
          refetch={() => {
            refetch();
            props.fetch();
          }}
        />
      }
    />
  );
};
