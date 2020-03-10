// @ngInject
export function tabsConfig(
  ResourceTabsConfigurationProvider,
  DEFAULT_RESOURCE_TABS,
) {
  ResourceTabsConfigurationProvider.register('Rancher.Cluster', {
    order: ['nodes', 'catalogs', ...DEFAULT_RESOURCE_TABS.order],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      nodes: {
        heading: gettext('Nodes'),
        component: 'rancherClusterNodes',
      },
      catalogs: {
        heading: gettext('Catalogs'),
        component: 'rancherClusterCatalogs',
      },
    }),
  });
  ResourceTabsConfigurationProvider.register('Rancher.Node', {
    order: [],
    options: {},
  });
}
