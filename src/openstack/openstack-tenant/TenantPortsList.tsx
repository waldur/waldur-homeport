import { XCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  OpenStackPort,
  openstackPortsList,
  OpenstackPortsListData,
  openstackPortsRetrieve,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { ActionButtonResource } from '@/resource/actions/ActionButtonResource';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { setToggled } from '@/table/actions';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { ToolbarButton } from '@/table/ToolbarButton';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CreatePortAction } from './actions/CreatePortAction';

const TABLE_ID = 'openstack-ports';

export const TenantPortsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const dispatch = useDispatch();
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();
  const targetPortUuid = params?.object as string | undefined;

  const clearPortFilter = useCallback(() => {
    router.stateService.go(state.name, { ...params, object: null });
  }, [router, state, params]);

  // Fetch backend_id of target port so we can filter the table to exactly that port
  const { data: targetPort } = useQuery({
    queryKey: ['port-for-expand', targetPortUuid],
    queryFn: () =>
      openstackPortsRetrieve({
        path: { uuid: targetPortUuid },
        query: { field: ['uuid', 'backend_id'] },
      }).then((res) => res.data),
    enabled: Boolean(targetPortUuid),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filter = useMemo(
    (): OpenstackPortsListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      ...(targetPort?.backend_id ? { backend_id: targetPort.backend_id } : {}),
      field: [
        'uuid',
        'url',
        'name',
        'description',
        'created',
        'error_message',
        'resource_type',
        'admin_state_up',
        'status',
        'state',
        'service_name',
        'service_settings',
        'service_settings_uuid',
        'service_settings_state',
        'service_settings_error_message',
        'device_id',
        'device_owner',
        'mac_address',
        'network_name',
        'network_uuid',
        'fixed_ips',
        'port_security_enabled',
        'allowed_address_pairs',
        'security_groups',
        'project_uuid',
        'backend_id',
      ],
      o: ['network_name'],
    }),
    [resourceScope, targetPort?.backend_id],
  );
  const props = useTable({
    table: TABLE_ID,
    fetchData: createFetcher(openstackPortsList),
    queryField: 'query',
    filter,
  });

  useEffect(() => {
    if (!targetPortUuid || !props.rows?.length) return;
    const match = props.rows.find((r) => r.uuid === targetPortUuid);
    if (match) {
      dispatch(setToggled(TABLE_ID, { [targetPortUuid]: true }));
    }
  }, [props.rows, targetPortUuid, dispatch]);

  return (
    <Table<OpenStackPort>
      {...props}
      columns={[
        {
          title: translate('IP address'),
          render: ({ row }) => (
            <>
              {row.fixed_ips && row.fixed_ips.length > 0
                ? row.fixed_ips.map((fip) => fip.ip_address).join(', ')
                : 'N/A'}
            </>
          ),
          copyField: (row) =>
            row.fixed_ips && row.fixed_ips.length > 0
              ? row.fixed_ips.map((fip) => fip.ip_address).join(', ')
              : '',
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => <>{renderFieldOrDash(row.mac_address)}</>,
          copyField: (row) => row.mac_address || '',
        },
        {
          title: translate('Network name'),
          render: ({ row }) => <>{renderFieldOrDash(row.network_name)}</>,
          copyField: (row) => row.network_name || '',
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <Badge
              variant={row.status === 'ACTIVE' ? 'success' : 'warning'}
              pill
              outline
            >
              {row.status}
            </Badge>
          ),
        },
        {
          title: translate('Admin state'),
          render: ({ row }) => (
            <Badge
              variant={row.admin_state_up ? 'success' : 'warning'}
              pill
              outline
            >
              {row.admin_state_up ? translate('Active') : translate('Inactive')}
            </Badge>
          ),
        },
        {
          title: translate('Port security enabled'),
          render: ({ row }) => (
            <Badge
              variant={row.port_security_enabled ? 'success' : 'danger'}
              pill
              outline
            >
              {row.port_security_enabled ? translate('Yes') : translate('No')}
            </Badge>
          ),
        },
      ]}
      tableActions={
        <>
          {targetPortUuid && (
            <ToolbarButton
              iconNode={<XCircleIcon weight="bold" />}
              title={translate('Show all ports')}
              onClick={clearPortFilter}
              className="me-2"
            />
          )}
          <CreatePortAction resource={resourceScope} refetch={props.fetch} />
        </>
      }
      rowActions={({ row }) => (
        <ActionButtonResource
          url={row.url}
          refetch={props.fetch}
          nestedResource
        />
      )}
      hasQuery={true}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      title={translate('Ports')}
      verboseName={translate('ports')}
      showPageSizeSelector
    />
  );
};
