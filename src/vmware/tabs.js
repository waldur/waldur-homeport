// @ngInject
export function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('VMware.VirtualMachine', {
    order: [
      'disks',
      'ports',
      ...DEFAULT_RESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      disks: {
        heading: gettext('Disks'),
        component: 'vmwareVirtualMachineDisks'
      },
      ports: {
        heading: gettext('Network adapters'),
        component: 'vmwareVirtualMachinePorts'
      },
    })
  });
}
