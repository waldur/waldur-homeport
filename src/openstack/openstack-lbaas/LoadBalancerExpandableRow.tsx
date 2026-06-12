import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  OpenStackLoadBalancer,
  OpenStackListener,
  OpenStackPool,
  OpenStackSecurityGroup,
  openstackFloatingIpsRetrieve,
  openstackListenersList,
  openstackPoolsList,
  openstackPortsRetrieve,
  openstackSecurityGroupsRetrieve,
  openstackTenantsRetrieve,
} from 'waldur-js-client';

import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { SecurityGroupRulesList } from '@/openstack/openstack-security-groups/SecurityGroupRulesList';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummaryBase } from '@/resource/summary/ResourceSummaryBase';
import { createClientPaginatedFetcher, createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const LB_VIP_SECURITY_GROUPS_QUERY_KEY = 'lb-vip-security-groups';

import { ListenerRowActions } from './ListenerRowActions';
import { OperatingStatusBadge } from './OperatingStatusBadge';
import { PoolExpandableRow } from './PoolExpandableRow';
import { PoolRowActions } from './PoolRowActions';

interface LoadBalancerExpandableRowProps {
  row: OpenStackLoadBalancer;
}

const ListenersTable: FC<{ loadBalancerUuid: string }> = ({
  loadBalancerUuid,
}) => {
  const filter = useMemo(
    () => ({ load_balancer_uuid: loadBalancerUuid }),
    [loadBalancerUuid],
  );
  const tableProps = useTable({
    table: `loadbalancer-listeners-${loadBalancerUuid}`,
    fetchData: createFetcher(openstackListenersList),
    filter,
  });

  const { data: pools } = useQuery({
    queryKey: ['lb-pools-for-listeners', loadBalancerUuid],
    queryFn: () =>
      openstackPoolsList({
        query: {
          load_balancer_uuid: loadBalancerUuid,
          page_size: 200,
          field: ['url', 'name'],
        },
      }).then((res) => res.data),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const poolNameByUrl = useMemo(
    () => new Map((pools || []).map((p) => [p.url, p.name])),
    [pools],
  );

  return (
    <Table<OpenStackListener>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.name),
        },
        {
          title: translate('Protocol'),
          render: ({ row }) => renderFieldOrDash(row.protocol),
        },
        {
          title: translate('Port'),
          render: ({ row }) => renderFieldOrDash(row.protocol_port),
        },
        {
          title: translate('Default pool'),
          render: ({ row }) =>
            row.default_pool
              ? renderFieldOrDash(poolNameByUrl.get(row.default_pool))
              : '—',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('listeners')}
      rowActions={ListenerRowActions}
      hasActionBar={false}
      minHeight="auto"
      initialPageSize={5}
    />
  );
};

const PoolsTable: FC<{ loadBalancerUuid: string }> = ({ loadBalancerUuid }) => {
  const filter = useMemo(
    () => ({ load_balancer_uuid: loadBalancerUuid }),
    [loadBalancerUuid],
  );
  const tableProps = useTable({
    table: `loadbalancer-pools-${loadBalancerUuid}`,
    fetchData: createFetcher(openstackPoolsList),
    filter,
  });
  return (
    <Table<OpenStackPool>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.name),
        },
        {
          title: translate('Protocol'),
          render: ({ row }) => renderFieldOrDash(row.protocol),
        },
        {
          title: translate('Algorithm'),
          render: ({ row }) => renderFieldOrDash(row.lb_algorithm),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <OperatingStatusBadge status={row.operating_status} />
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('pools')}
      rowActions={PoolRowActions}
      expandableRow={PoolExpandableRow}
      hasActionBar={false}
      minHeight="auto"
      initialPageSize={5}
    />
  );
};

const SecurityGroupsTab: FC<{
  loadBalancerUuid: string;
  vipPort?: string | null;
}> = ({ loadBalancerUuid, vipPort }) => {
  const portUuid = vipPort ? getUUID(vipPort) : null;

  const {
    data: securityGroups,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [LB_VIP_SECURITY_GROUPS_QUERY_KEY, loadBalancerUuid],
    queryFn: async () => {
      if (!portUuid) return [];
      const portRes = await openstackPortsRetrieve({
        path: { uuid: portUuid },
        query: { field: ['uuid', 'security_groups'] },
      });
      const sgUuids = (portRes.data?.security_groups || [])
        .map((sg) => sg.uuid)
        .filter(Boolean);
      if (sgUuids.length === 0) return [];
      const results = await Promise.all(
        sgUuids.map((uuid) =>
          openstackSecurityGroupsRetrieve({
            path: { uuid },
            query: {
              field: [
                'uuid',
                'url',
                'name',
                'description',
                'state',
                'rules',
                'resource_type',
              ],
            },
          }).then((res) => res.data),
        ),
      );
      return results;
    },
    enabled: Boolean(portUuid),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const tableProps = useTable({
    table: `lb-vip-sgs-${loadBalancerUuid}`,
    fetchData: createClientPaginatedFetcher(securityGroups || []),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [securityGroups]);

  if (!portUuid) {
    return (
      <p className="text-muted py-3">{translate('No VIP port assigned.')}</p>
    );
  }
  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;

  return (
    <Table<OpenStackSecurityGroup>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('security groups')}
      expandableRow={SecurityGroupRulesList}
      hasActionBar={false}
      minHeight="auto"
    />
  );
};

const VipPortDetails: FC<{
  vipPortUrl?: string | null;
  tenantUuid?: string;
}> = ({ vipPortUrl, tenantUuid }) => {
  const portUuid = vipPortUrl ? getUUID(vipPortUrl) : null;

  const { data: port } = useQuery({
    queryKey: ['lb-vip-port-details', portUuid],
    queryFn: () =>
      openstackPortsRetrieve({
        path: { uuid: portUuid },
        query: {
          field: [
            'uuid',
            'name',
            'fixed_ips',
            'mac_address',
            'network_name',
            'status',
          ],
        },
      }).then((res) => res.data),
    enabled: Boolean(portUuid),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const { data: tenantMarketplaceUuid } = useQuery({
    queryKey: ['lb-tenant-marketplace-uuid', tenantUuid],
    queryFn: () =>
      openstackTenantsRetrieve({
        path: { uuid: tenantUuid },
        query: { field: ['marketplace_resource_uuid'] },
      }).then((res) => res.data?.marketplace_resource_uuid ?? null),
    enabled: Boolean(tenantUuid),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  if (!portUuid) return null;

  const ipAddresses = port?.fixed_ips?.length
    ? port.fixed_ips.map((fip) => fip.ip_address).join(', ')
    : null;

  const portLabel = port?.name || port?.uuid || portUuid;

  return (
    <div className="mt-4 border-top pt-4">
      <div className="row mb-2">
        <div className="col-sm-3 fw-bold text-muted">
          {translate('VIP port')}
        </div>
        <div className="col-sm-9">
          {tenantMarketplaceUuid ? (
            <Link
              state="marketplace-resource-details"
              params={{
                resource_uuid: tenantMarketplaceUuid,
                tab: 'ports',
                object: portUuid,
              }}
              label={portLabel}
            />
          ) : (
            <span>{portLabel}</span>
          )}
        </div>
      </div>
      {ipAddresses && (
        <div className="row mb-2">
          <div className="col-sm-3 fw-bold text-muted">
            {translate('VIP port IPs')}
          </div>
          <div className="col-sm-9">{ipAddresses}</div>
        </div>
      )}
      {port?.mac_address && (
        <div className="row mb-2">
          <div className="col-sm-3 fw-bold text-muted">
            {translate('MAC address')}
          </div>
          <div className="col-sm-9">{port.mac_address}</div>
        </div>
      )}
      {port?.network_name && (
        <div className="row mb-2">
          <div className="col-sm-3 fw-bold text-muted">
            {translate('Network')}
          </div>
          <div className="col-sm-9">{port.network_name}</div>
        </div>
      )}
    </div>
  );
};

const FloatingIpDetails: FC<{ floatingIpUrl?: string | null }> = ({
  floatingIpUrl,
}) => {
  const floatingIpUuid = floatingIpUrl ? getUUID(floatingIpUrl) : null;

  const { data: floatingIp } = useQuery({
    queryKey: ['lb-floating-ip', floatingIpUuid],
    queryFn: () =>
      openstackFloatingIpsRetrieve({
        path: { uuid: floatingIpUuid },
        query: { field: ['uuid', 'address', 'name'] },
      }).then((res) => res.data),
    enabled: Boolean(floatingIpUuid),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  if (!floatingIpUrl) return null;

  return (
    <div className="mt-4 border-top pt-4">
      <div className="row mb-2">
        <div className="col-sm-3 fw-bold text-muted">
          {translate('Floating IP')}
        </div>
        <div className="col-sm-9">
          {floatingIp?.address ? floatingIp.address : renderFieldOrDash(null)}
          {floatingIp?.name && (
            <span className="text-muted ms-2">({floatingIp.name})</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const LoadBalancerExpandableRow: FC<LoadBalancerExpandableRowProps> = ({
  row,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  return (
    <ExpandableContainer>
      <Tab.Container
        activeKey={activeTab}
        onSelect={setActiveTab}
        unmountOnExit
      >
        <Nav variant="tabs" className="nav-line-tabs flex-nowrap mb-4">
          <Nav.Item>
            <Nav.Link eventKey="details">{translate('Details')}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="security-groups">
              {translate('Security group rules')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="listeners">{translate('Listeners')}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="pools">{translate('Pools')}</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="overflow-auto">
          <Tab.Pane eventKey="details" unmountOnExit>
            <ResourceSummaryBase resource={row} />
            <VipPortDetails
              vipPortUrl={row.vip_port}
              tenantUuid={row.tenant_uuid}
            />
            <FloatingIpDetails floatingIpUrl={row.attached_floating_ip} />
          </Tab.Pane>
          <Tab.Pane eventKey="security-groups" unmountOnExit>
            <SecurityGroupsTab
              loadBalancerUuid={row.uuid}
              vipPort={row.vip_port}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="listeners" unmountOnExit>
            <ListenersTable loadBalancerUuid={row.uuid} />
          </Tab.Pane>
          <Tab.Pane eventKey="pools" unmountOnExit>
            <PoolsTable loadBalancerUuid={row.uuid} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </ExpandableContainer>
  );
};
