import { StateDeclaration } from '@waldur/core/types';

import { CatalogTemplateContainer } from './template/CatalogTemplateContainer';
import { TemplateDetail } from './template/TemplateDetail';

export const states: StateDeclaration[] = [
  {
    name: 'rancher-catalog-details',
    url: 'rancher-catalog-details/:clusterUuid/:catalogUuid/',
    component: CatalogTemplateContainer,
    parent: 'project',
  },
  {
    name: 'rancher-template-details',
    url: 'rancher-template-details/:clusterUuid/:templateUuid/',
    component: TemplateDetail,
    parent: 'project',
  },
];
