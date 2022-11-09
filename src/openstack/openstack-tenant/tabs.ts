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

NestedResourceTabsConfiguration.register('OpenStack.Tenant', () => [
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
]);
