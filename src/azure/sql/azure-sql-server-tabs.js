// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_SUBRESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('Azure.SQLServer', {
    order: [
      'databases',
      ...DEFAULT_SUBRESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_SUBRESOURCE_TABS.options, {
      databases: {
        heading: gettext('Databases'),
        component: 'azureSQLDatabasesList',
      },
    })
  });
}
