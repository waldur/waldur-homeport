import { Table } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';

import { GroupSection } from '../GroupSection';

import { FlavorsSection } from './FlavorsSection';
import { FloatingIPsSection } from './FloatingIPsSection';
import { InstancesSection } from './InstancesSection';
import { NetworksSection } from './NetworksSection';
import { PortsSection } from './PortsSection';
import { RoutersSection } from './RoutersSection';
import { SecurityGroupsSection } from './SecurityGroupsSection';
import { ServerGroupsSection } from './ServerGroupsSection';
import { SnapshotsSection } from './SnapshotsSection';
import { SubnetsSection } from './SubnetsSection';
import { VolumesSection } from './VolumesSection';

interface TenantCounters {
  instances: number;
  server_groups: number;
  security_groups: number;
  flavors: number;
  images: number;
  volumes: number;
  snapshots: number;
  networks: number;
  floating_ips: number;
  ports: number;
  routers: number;
  subnets: number;
}

export const TenantDetails = ({ resource }) => {
  const { loading, error, value } = useAsync(async () => {
    const tenant = (await get<OpenStackTenant>(resource.scope)).data;
    const counters = (await get<TenantCounters>(resource.scope + 'counters/'))
      .data;
    return { tenant, counters };
  });

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load resource details.')}</>;

  return (
    <Table>
      <thead>
        <tr>
          <th style={{ width: 10 }}>{/* Icon column */}</th>
          <th>{translate('Component')}</th>
          <th>{translate('State')}</th>
          <th>{translate('Summary')}</th>
          <th>{translate('Details')}</th>
        </tr>
      </thead>
      <GroupSection
        title={translate('Compute')}
        summary={translate(
          '{instances} instances, {flavors} flavors, {server_groups} server groups',
          value.counters,
        )}
      >
        <InstancesSection
          resource={value.tenant}
          count={value.counters.instances}
        />
        <FlavorsSection
          resource={value.tenant}
          count={value.counters.flavors}
        />
        <ServerGroupsSection
          resource={value.tenant}
          count={value.counters.server_groups}
        />
      </GroupSection>
      <GroupSection
        title={translate('Networking')}
        summary={translate(
          '{routers} routers, {networks} networks, {subnets} subnets, {security_groups} security groups, {floating_ips} floating IPs, {ports} ports',
          value.counters,
        )}
      >
        <RoutersSection
          resource={value.tenant}
          count={value.counters.routers}
        />
        <NetworksSection
          resource={value.tenant}
          count={value.counters.networks}
        />
        <SubnetsSection
          resource={value.tenant}
          count={value.counters.subnets}
        />
        <SecurityGroupsSection
          resource={value.tenant}
          count={value.counters.security_groups}
        />
        <FloatingIPsSection
          resource={value.tenant}
          count={value.counters.floating_ips}
        />
        <PortsSection resource={value.tenant} count={value.counters.ports} />
      </GroupSection>
      <GroupSection
        title={translate('Storage')}
        summary={translate(
          '{volumes} volumes, {snapshots} snapshots',
          value.counters,
        )}
      >
        <VolumesSection
          resource={value.tenant}
          count={value.counters.volumes}
        />
        <SnapshotsSection
          resource={value.tenant}
          count={value.counters.snapshots}
        />
      </GroupSection>
    </Table>
  );
};
