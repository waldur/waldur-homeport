import { useMemo } from 'react';
import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';

import { ResourceTabs } from '../ResourceTabs';

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

  const tabs = useMemo(
    () =>
      resource && value
        ? [
            {
              title: translate('Compute'),
              children: [
                {
                  title: translate('Instances'),
                  count: value.counters.instances,
                  component: InstancesSection,
                },
                {
                  title: translate('Flavors'),
                  count: value.counters.flavors,
                  component: FlavorsSection,
                },
                {
                  title: translate('Server groups'),
                  count: value.counters.server_groups,
                  component: ServerGroupsSection,
                },
              ],
            },
            {
              title: translate('Networking'),
              children: [
                {
                  title: translate('Routers'),
                  count: value.counters.routers,
                  component: RoutersSection,
                },
                {
                  title: translate('Networks'),
                  count: value.counters.networks,
                  component: NetworksSection,
                },
                {
                  title: translate('Subnets'),
                  count: value.counters.subnets,
                  component: SubnetsSection,
                },
                {
                  title: translate('Security groups'),
                  count: value.counters.security_groups,
                  component: SecurityGroupsSection,
                },
                {
                  title: translate('Floating IPs'),
                  count: value.counters.floating_ips,
                  component: FloatingIPsSection,
                },
                {
                  title: translate('Ports'),
                  count: value.counters.ports,
                  component: PortsSection,
                },
              ],
            },
            {
              title: translate('Storage'),
              children: [
                {
                  title: translate('Volumes'),
                  count: value.counters.volumes,
                  component: VolumesSection,
                },
                {
                  title: translate('Snapshots'),
                  count: value.counters.snapshots,
                  component: SnapshotsSection,
                },
              ],
            },
          ]
        : [],
    [resource, value],
  );

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load resource details.')}</>;

  return <ResourceTabs tabs={tabs} resource={value.tenant} />;
};
