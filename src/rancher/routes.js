import { withStore } from '@waldur/store/connect';

import { CatalogTemplatesList } from './template/CatalogTemplateList';
import { TemplateDetail } from './template/TemplateDetail';

// @ngInject
export default function rancherRoutes($stateProvider) {
  $stateProvider
    .state('rancher-catalog-details', {
      url: 'rancher-catalog-details/:clusterUuid/:catalogUuid/',
      component: withStore(CatalogTemplatesList),
      parent: 'project',
    })
    .state('rancher-template-details', {
      url: 'rancher-template-details/:clusterUuid/:templateUuid/',
      component: withStore(TemplateDetail),
      parent: 'project',
    });
}
