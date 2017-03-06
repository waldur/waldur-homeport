// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'networks',
      'security_groups',
      'floating_ips',
      'quotas'
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      networks: {
        heading: 'Networks',
        component: 'openstackTenantNetworks'
      },
      security_groups: {
        heading: 'Security groups',
        component: 'openstackSecurityGroupsList'
      },
      floating_ips: {
        heading: 'Floating IPs',
        component: 'openstackFloatingIpsList'
      },
      quotas: {
        heading: 'Quotas',
        component: 'quotasTable'
      },
    })
  });
}
