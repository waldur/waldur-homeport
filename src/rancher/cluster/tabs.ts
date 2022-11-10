import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';

const ClusterUsersList = lazyComponent(
  () => import('@waldur/rancher/cluster/users/ClusterUsersList'),
  'ClusterUsersList',
);
const ClusterCatalogList = lazyComponent(
  () => import('../catalog/ClusterCatalogList'),
  'ClusterCatalogList',
);
const ClusterProjectList = lazyComponent(
  () => import('../ClusterProjectList'),
  'ClusterProjectList',
);
const ClusterNodesList = lazyComponent(
  () => import('../node/ClusterNodesList'),
  'ClusterNodesList',
);
const ClusterTemplatesList = lazyComponent(
  () => import('../template/ClusterTemplateList'),
  'ClusterTemplatesList',
);
const ClusterApplicationsList = lazyComponent(
  () => import('./apps/ClusterApplicationsList'),
  'ClusterApplicationsList',
);
const ClusterIngressesList = lazyComponent(
  () => import('./ClusterIngressesList'),
  'ClusterIngressesList',
);
const ClusterServicesList = lazyComponent(
  () => import('./ClusterServicesList'),
  'ClusterServicesList',
);
const ClusterWorkloadsList = lazyComponent(
  () => import('./ClusterWorkloadsList'),
  'ClusterWorkloadsList',
);
const ClusterHPAList = lazyComponent(
  () => import('./hpas/ClusterHPAList'),
  'ClusterHPAList',
);

NestedResourceTabsConfiguration.register('Rancher.Cluster', () => [
  {
    title: translate('Cluster'),
    children: [
      {
        key: 'nodes',
        title: translate('Nodes'),
        component: ClusterNodesList,
      },
      {
        key: 'projects',
        title: translate('Projects'),
        component: ClusterProjectList,
      },
      {
        key: 'users',
        title: translate('Users'),
        component: ClusterUsersList,
      },
    ],
  },
  {
    title: translate('Apps'),
    children: [
      {
        key: 'templates',
        title: translate('Application templates'),
        component: ClusterTemplatesList,
      },
      {
        key: 'applications',
        title: translate('Applications'),
        component: ClusterApplicationsList,
      },
      {
        key: 'workloads',
        title: translate('Workloads'),
        component: ClusterWorkloadsList,
      },
      {
        key: 'catalogs',
        title: translate('Catalogues'),
        component: ClusterCatalogList,
      },
    ],
  },
  {
    title: translate('Service discovery'),
    children: [
      {
        key: 'hpas',
        title: translate('HPA'),
        component: ClusterHPAList,
      },
      {
        key: 'ingresses',
        title: translate('Ingress'),
        component: ClusterIngressesList,
      },
      {
        key: 'services',
        title: translate('Services'),
        component: ClusterServicesList,
      },
    ],
  },
]);
