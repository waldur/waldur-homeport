import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';

const FloatingIpsList = lazyComponent(
  () => import('../openstack-floating-ips/FloatingIpsList'),
  'FloatingIpsList',
);
const TenantNetworksList = lazyComponent(
  () => import('../openstack-network/TenantNetworksList'),
  'TenantNetworksList',
);
const TenantSubnetsList = lazyComponent(
  () => import('../openstack-subnet/TenantSubnetsList'),
  'TenantSubnetsList',
);
const SecurityGroupsList = lazyComponent(
  () => import('../openstack-security-groups/SecurityGroupsList'),
  'SecurityGroupsList',
);
const ServerGroupsList = lazyComponent(
  () => import('../openstack-server-groups/ServerGroupsList'),
  'ServerGroupsList',
);
const TenantPortsList = lazyComponent(
  () => import('./TenantPortsList'),
  'TenantPortsList',
);
const TenantRoutersList = lazyComponent(
  () => import('./TenantRoutersList'),
  'TenantRoutersList',
);
const TenantFlavorsList = lazyComponent(
  () => import('./TenantFlavorsList'),
  'TenantFlavorsList',
);
const TenantServerGroupsList = lazyComponent(
  () => import('./TenantServerGroupsList'),
  'TenantServerGroupsList',
);
const TenantInstancesList = lazyComponent(
  () => import('./TenantInstancesList'),
  'TenantInstancesList',
);
const TenantVolumesList = lazyComponent(
  () => import('../openstack-volume/TenantVolumesList'),
  'TenantVolumesList',
);
const TenantSnapshotsList = lazyComponent(
  () => import('../openstack-snapshot/TenantSnapshotsList'),
  'TenantSnapshotsList',
);

NestedResourceTabsConfiguration.register('OpenStack.Tenant', () => [
  {
    title: translate('Compute'),
    children: [
      {
        key: 'instances',
        title: translate('Instances'),
        component: TenantInstancesList,
      },
      {
        key: 'flavors',
        title: translate('Flavors'),
        component: TenantFlavorsList,
      },
      {
        key: 'server-groups',
        title: translate('Server groups'),
        component: TenantServerGroupsList,
      },
    ],
  },
  {
    title: translate('Networking'),
    children: [
      {
        key: 'routers',
        title: translate('Routers'),
        component: TenantRoutersList,
      },
      {
        key: 'networks',
        title: translate('Networks'),
        component: TenantNetworksList,
      },
      {
        key: 'subnets',
        title: translate('Subnets'),
        component: TenantSubnetsList,
      },
      {
        key: 'security_groups',
        title: translate('Security groups'),
        component: SecurityGroupsList,
      },
      ...(isFeatureVisible('openstack.server_groups')
        ? [
            {
              key: 'server_groups',
              title: translate('Server groups'),
              component: ServerGroupsList,
            },
          ]
        : []),
      {
        key: 'floating_ips',
        title: translate('Floating IPs'),
        component: FloatingIpsList,
      },
      {
        key: 'ports',
        title: translate('Ports'),
        component: TenantPortsList,
      },
    ],
  },
  {
    title: translate('Storage'),
    children: [
      {
        key: 'volumes',
        title: translate('Volumes'),
        component: TenantVolumesList,
      },
      {
        key: 'snapshots',
        title: translate('Snapshots'),
        component: TenantSnapshotsList,
      },
    ],
  },
]);
