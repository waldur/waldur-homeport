// @ngInject
export function tabsConfig(
  ResourceTabsConfigurationProvider,
  DEFAULT_RESOURCE_TABS,
) {
  ResourceTabsConfigurationProvider.register('Rancher.Cluster', {
    order: [
      'nodes',
      'catalogs',
      'projects',
      'templates',
      ...DEFAULT_RESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      nodes: {
        heading: gettext('Nodes'),
        component: 'rancherClusterNodes',
      },
      catalogs: {
        heading: gettext('Catalogues'),
        component: 'rancherClusterCatalogs',
      },
      projects: {
        heading: gettext('Projects'),
        component: 'rancherClusterProjects',
      },
      templates: {
        heading: gettext('Application templates'),
        component: 'rancherClusterTemplates',
      },
    }),
  });
}
