import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { angular2react } from '@waldur/shims/angular2react';

import { FloatingIpsList } from '../openstack-floating-ips/FloatingIpsList';
import { TenantNetworksList } from '../openstack-network/TenantNetworksList';
import { SecurityGroupsList } from '../openstack-security-groups/SecurityGroupsList';

const QuotasTable = angular2react('quotasTable', ['resource']);

// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('OpenStack.Tenant', () => [
    {
      key: 'networks',
      title: gettext('Networks'),
      component: TenantNetworksList,
    },
    {
      key: 'security_groups',
      title: gettext('Security groups'),
      component: SecurityGroupsList,
    },
    {
      key: 'floating_ips',
      title: gettext('Floating IPs'),
      component: FloatingIpsList,
    },
    {
      key: 'quotas',
      title: gettext('Quotas'),
      component: QuotasTable,
    },
    ...getDefaultResourceTabs(),
  ]);
}
