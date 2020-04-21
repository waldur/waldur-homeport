import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';
import { angular2react } from '@waldur/shims/angular2react';

import { FloatingIpsList } from '../openstack-floating-ips/FloatingIpsList';
import { TenantNetworksList } from '../openstack-network/TenantNetworksList';
import { SecurityGroupsList } from '../openstack-security-groups/SecurityGroupsList';

const QuotasTable = angular2react('quotasTable', ['resource']);

ResourceTabsConfiguration.register('OpenStack.Tenant', () => [
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
    key: 'quotas',
    title: translate('Quotas'),
    component: QuotasTable,
  },
  ...getDefaultResourceTabs(),
]);
