// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_SUBRESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Backup', {
    order: [
      'snapshots',
      ...DEFAULT_SUBRESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_SUBRESOURCE_TABS.options, {
      snapshots: {
        heading: gettext('Snapshots'),
        component: 'backupSnapshotsList'
      },
    })
  });
}
