import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { Template, Cluster } from '../types';

export const refreshBreadcrumbs = (cluster: Cluster, template: Template) => {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  BreadcrumbsService.items = [
    {
      label: translate('Project workspace'),
      state: 'project.details',
    },
    {
      label: translate('Resources'),
      state: 'marketplace-project-resources',
      params: {
        category_uuid: cluster.marketplace_category_uuid,
      },
    },
    {
      label: cluster.name,
      state: 'resources.details',
      params: {
        resource_type: 'Rancher.Cluster',
        uuid: cluster.uuid,
        tab: 'catalogs',
      },
    },
    {
      label: translate('Application catalogues'),
    },
    {
      label: template.catalog_name,
      state: 'rancher-catalog-details',
      params: {
        clusterUuid: cluster.uuid,
        catalogUuid: template.catalog_uuid,
      },
    },
    {
      label: translate('Application templates'),
    },
  ];
  BreadcrumbsService.activeItem = template.name;
};
