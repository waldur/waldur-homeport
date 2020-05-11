import { gettext } from '@waldur/i18n';
import { ResourceBreadcrumbsRegistry } from '@waldur/resource/breadcrumbs/ResourceBreadcrumbsRegistry';

ResourceBreadcrumbsRegistry.register('Rancher.Node', resource => {
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
