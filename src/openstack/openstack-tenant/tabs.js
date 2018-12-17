// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      'networks',
      'security_groups',
      'floating_ips',
      'quotas',
      ...DEFAULT_RESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      networks: {
        heading: gettext('Networks'),
        component: 'openstackTenantNetworks'
      },
      security_groups: {
        heading: gettext('Security groups'),
        component: 'openstackSecurityGroupsList'
      },
      floating_ips: {
        heading: gettext('Floating IPs'),
        component: 'openstackFloatingIpsList'
      },
      quotas: {
        heading: gettext('Quotas'),
        component: 'quotasTable'
      },
    })
  });
}
