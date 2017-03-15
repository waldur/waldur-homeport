// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Backup', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'snapshots',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      snapshots: {
        heading: gettext('Snapshots'),
        component: 'backupSnapshotsList'
      },
    })
  });
}
