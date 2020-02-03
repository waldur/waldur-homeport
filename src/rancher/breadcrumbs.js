// @ngInject
export default function breadcrumbsConfig(ResourceBreadcrumbsService) {
  ResourceBreadcrumbsService.register('Rancher.Node', resource => {
    return [
      {
        label: resource.cluster_name,
        state: 'resources.details',
        params: {
          uuid: resource.cluster_uuid,
          resource_type: 'Rancher.Cluster',
        },
      },
      {
        label: gettext('Nodes'),
        state: 'resources.details',
        params: {
          uuid: resource.cluster_uuid,
          resource_type: 'Rancher.Cluster',
          tab: 'nodes',
        },
      },
    ];
  });
}
