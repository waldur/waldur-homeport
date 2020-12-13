import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const CatalogTemplateContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RancherCatalogTemplateContainer" */ './template/CatalogTemplateContainer'
    ),
  'CatalogTemplateContainer',
);
const TemplateDetail = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RancherTemplateDetail" */ './template/TemplateDetail'
    ),
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
