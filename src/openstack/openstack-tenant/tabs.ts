import { lazyComponent } from '@waldur/core/lazyComponent';
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
const TenantImagesList = lazyComponent(
  () => import('./TenantImagesList'),
  'TenantImagesList',
);

NestedResourceTabsConfiguration.register('OpenStack.Tenant', () => [
  {
    title: translate('Compute'),
    key: 'compute',
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
        key: 'images',
        title: translate('Images'),
        component: TenantImagesList,
      },
      {
        key: 'server_groups',
        title: translate('Server groups'),
        component: ServerGroupsList,
      },
    ],
  },
  {
    title: translate('Networking'),
    key: 'networking',
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
    key: 'storage',
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
