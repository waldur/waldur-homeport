import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const CatalogTemplateContainer = lazyComponent(
  () => import('./template/CatalogTemplateContainer'),
  'CatalogTemplateContainer',
);
const TemplateDetail = lazyComponent(
  () => import('./template/TemplateDetail'),
  'TemplateDetail',
);

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
