import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ResourceTabsConfiguration } from '@/resource/tabs/types';

export const OpenStackTenantTabConfiguration: ResourceTabsConfiguration = {
  type: 'OpenStack.Tenant',
  tabs: [
    {
      title: translate('Compute'),
      key: 'compute',
      children: [
        {
          key: 'instances',
          title: translate('Instances'),
          component: lazyComponent(() =>
            import('./TenantInstancesList').then((module) => ({
              default: module.TenantInstancesList,
            })),
          ),
        },
        {
          key: 'flavors',
          title: translate('Flavors'),
          component: lazyComponent(() =>
            import('./TenantFlavorsTable').then((module) => ({
              default: module.TenantFlavorsTable,
            })),
          ),
        },
        {
          key: 'images',
          title: translate('Images'),
          component: lazyComponent(() =>
            import('./TenantImagesTable').then((module) => ({
              default: module.TenantImagesTable,
            })),
          ),
        },
        {
          key: 'server_groups',
          title: translate('Server groups'),
          component: lazyComponent(() =>
            import('../openstack-server-groups/ServerGroupsList').then(
              (module) => ({
                default: module.ServerGroupsList,
              }),
            ),
          ),
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
          component: lazyComponent(() =>
            import('./TenantRoutersList').then((module) => ({
              default: module.TenantRoutersList,
            })),
          ),
        },
        {
          key: 'networks',
          title: translate('Networks'),
          component: lazyComponent(() =>
            import('../openstack-network/TenantNetworksList').then(
              (module) => ({
                default: module.TenantNetworksList,
              }),
            ),
          ),
        },
        {
          key: 'subnets',
          title: translate('Subnets'),
          component: lazyComponent(() =>
            import('../openstack-subnet/TenantSubnetsList').then((module) => ({
              default: module.TenantSubnetsList,
            })),
          ),
        },
        {
          key: 'security_groups',
          title: translate('Security groups'),
          component: lazyComponent(() =>
            import('../openstack-security-groups/SecurityGroupsList').then(
              (module) => ({
                default: module.SecurityGroupsList,
              }),
            ),
          ),
        },
        {
          key: 'floating_ips',
          title: translate('Floating IPs'),
          component: lazyComponent(() =>
            import('../openstack-floating-ips/FloatingIpsList').then(
              (module) => ({
                default: module.FloatingIpsList,
              }),
            ),
          ),
        },
        {
          key: 'ports',
          title: translate('Ports'),
          component: lazyComponent(() =>
            import('./TenantPortsList').then((module) => ({
              default: module.TenantPortsList,
            })),
          ),
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
          component: lazyComponent(() =>
            import('../openstack-volume/TenantVolumesList').then((module) => ({
              default: module.TenantVolumesList,
            })),
          ),
        },
        {
          key: 'volume-types',
          title: translate('Volume types'),
          component: lazyComponent(() =>
            import('../openstack-volume/TenantVolumeTypesTable').then(
              (module) => ({
                default: module.TenantVolumeTypesTable,
              }),
            ),
          ),
        },
        {
          key: 'snapshots',
          title: translate('Snapshots'),
          component: lazyComponent(() =>
            import('../openstack-snapshot/TenantSnapshotsList').then(
              (module) => ({
                default: module.TenantSnapshotsList,
              }),
            ),
          ),
        },
      ],
    },
  ],
};
