import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'rancher-catalog-details',
    url: 'rancher-catalog-details/:clusterUuid/:catalogUuid/',
    component: lazyComponent(() =>
      import('./template/CatalogTemplateContainer').then((module) => ({
        default: module.CatalogTemplateContainer,
      })),
    ),
    parent: 'project',
  },
  {
    name: 'rancher-template-details',
    url: 'rancher-template-details/:clusterUuid/:templateUuid/',
    component: lazyComponent(() =>
      import('./template/TemplateDetail').then((module) => ({
        default: module.TemplateDetail,
      })),
    ),
    parent: 'project',
  },
];
