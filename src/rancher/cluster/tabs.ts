import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const ClusterUsersList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ClusterUsersList" */ '@waldur/rancher/cluster/users/ClusterUsersList'
    ),
  'ClusterUsersList',
);
const ClusterCatalogList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ClusterCatalogList" */ '../catalog/ClusterCatalogList'
    ),
  'ClusterCatalogList',
);
const ClusterProjectList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ClusterProjectList" */ '../ClusterProjectList'
    ),
  'ClusterProjectList',
);
const ClusterNodesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ClusterNodesList" */ '../node/ClusterNodesList'
    ),
  'ClusterNodesList',
);
const ClusterTemplatesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ClusterTemplateList" */ '../template/ClusterTemplateList'
    ),
  'ClusterTemplatesList',
);
const ClusterApplicationsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RancherClusterApplicationsList" */ './apps/ClusterApplicationsList'
    ),
  'ClusterApplicationsList',
);
const ClusterIngressesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RancherClusterIngressesList" */ './ClusterIngressesList'
    ),
  'ClusterIngressesList',
);
const ClusterServicesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RancherClusterServicesList" */ './ClusterServicesList'
    ),
  'ClusterServicesList',
);
const ClusterWorkloadsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RancherClusterWorkloadsList" */ './ClusterWorkloadsList'
    ),
  'ClusterWorkloadsList',
);
const ClusterHPAList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RancherClusterHPAList" */ './hpas/ClusterHPAList'
    ),
  'ClusterHPAList',
);

ResourceTabsConfiguration.register('Rancher.Cluster', () => [
  {
    key: 'nodes',
    title: translate('Nodes'),
    component: ClusterNodesList,
  },
  {
    key: 'catalogs',
    title: translate('Catalogues'),
    component: ClusterCatalogList,
  },
  {
    key: 'projects',
    title: translate('Projects'),
    component: ClusterProjectList,
  },
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
    key: 'users',
    title: translate('Users'),
    component: ClusterUsersList,
  },
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
  ...getDefaultResourceTabs(),
]);
