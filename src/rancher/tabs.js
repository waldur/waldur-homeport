// @ngInject
export function tabsConfig(
  ResourceTabsConfigurationProvider,
  DEFAULT_RESOURCE_TABS,
) {
  ResourceTabsConfigurationProvider.register('Rancher.Cluster', {
    order: ['nodes', 'catalogs', 'projects', ...DEFAULT_RESOURCE_TABS.order],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      nodes: {
        heading: gettext('Nodes'),
        component: 'rancherClusterNodes',
      },
      catalogs: {
        heading: gettext('Catalogs'),
        component: 'rancherClusterCatalogs',
      },
      projects: {
        heading: gettext('Projects'),
        component: 'rancherClusterProjects',
      },
    }),
  });
  ResourceTabsConfigurationProvider.register('Rancher.Node', {
    order: [],
    options: {},
  });
}
