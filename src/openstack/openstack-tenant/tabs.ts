import { translate } from '@waldur/i18n';
import { QuotasTable } from '@waldur/quotas/QuotasTable';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { FloatingIpsList } from '../openstack-floating-ips/FloatingIpsList';
import { TenantNetworksList } from '../openstack-network/TenantNetworksList';
import { SecurityGroupsList } from '../openstack-security-groups/SecurityGroupsList';

import { TenantPortsList } from './TenantPortsList';
import { TenantRoutersList } from './TenantRoutersList';

ResourceTabsConfiguration.register('OpenStack.Tenant', () => [
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
  {
    key: 'quotas',
    title: translate('Quotas'),
    component: QuotasTable,
  },
  ...getDefaultResourceTabs(),
]);
