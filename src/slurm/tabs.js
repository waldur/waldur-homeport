// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('SLURM.Allocation', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'usage',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      usage: {
        heading: 'Usage',
        component: 'slurmAllocationUsageTable'
      },
    })
  });
}
