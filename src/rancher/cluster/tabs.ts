import { lazyComponent } from '@waldur/core/lazyComponent';
import { RancherFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/types';

export const RancherClusterTabConfiguration: ResourceTabsConfiguration = {
  type: 'Rancher.Cluster',
  tabs: [
    {
      title: translate('Cluster'),
      key: 'cluster',
      component: lazyComponent(() =>
        import('./ClusterTable').then((module) => ({
          default: module.ClusterTable,
        })),
      ),
      defaultKey: 'nodes',
      children: [
        {
          key: 'nodes',
          title: translate('Nodes'),
          visible: false,
          component: lazyComponent(() =>
            import('../node/ClusterNodesList').then((module) => ({
              default: module.ClusterNodesList,
            })),
          ),
        },
        {
          key: 'projects',
          title: translate('Projects'),
          visible: false,
          component: lazyComponent(() =>
            import('../ClusterProjectList').then((module) => ({
              default: module.ClusterProjectList,
            })),
          ),
        },
        {
          key: 'users',
          title: translate('Users'),
          visible: false,
          component: lazyComponent(() =>
            import('@waldur/rancher/cluster/users/ClusterUsersList').then(
              (module) => ({
                default: module.ClusterUsersList,
              }),
            ),
          ),
        },
      ],
    },
    {
      title: translate('Apps'),
      key: 'apps',
      component: lazyComponent(() =>
        import('./AppsTable').then((module) => ({
          default: module.AppsTable,
        })),
      ),
      defaultKey: 'templates',
      children: [
        {
          key: 'templates',
          title: translate('Application templates'),
          component: lazyComponent(() =>
            import('../template/ClusterTemplateList').then((module) => ({
              default: module.ClusterTemplatesList,
            })),
          ),
        },
        {
          key: 'applications',
          title: translate('Applications'),
          component: lazyComponent(() =>
            import('./apps/ClusterApplicationsList').then((module) => ({
              default: module.ClusterApplicationsList,
            })),
          ),
        },
        {
          key: 'workloads',
          title: translate('Workloads'),
          component: lazyComponent(() =>
            import('./ClusterWorkloadsList').then((module) => ({
              default: module.ClusterWorkloadsList,
            })),
          ),
        },
        {
          key: 'catalogs',
          title: translate('Catalogues'),
          component: lazyComponent(() =>
            import('../catalog/ClusterCatalogList').then((module) => ({
              default: module.ClusterCatalogList,
            })),
          ),
          feature: RancherFeatures.apps,
        },
      ],
    },
    {
      title: translate('Service discovery'),
      key: 'service-discovery',
      component: lazyComponent(() =>
        import('./ServiceDiscoveryTable').then((module) => ({
          default: module.ServiceDiscoveryTable,
        })),
      ),
      defaultKey: 'hpas',
      children: [
        {
          key: 'hpas',
          title: translate('HPA'),
          visible: false,
          component: lazyComponent(() =>
            import('./hpas/ClusterHPAList').then((module) => ({
              default: module.ClusterHPAList,
            })),
          ),
        },
        {
          key: 'ingresses',
          title: translate('Ingress'),
          visible: false,
          component: lazyComponent(() =>
            import('./ClusterIngressesList').then((module) => ({
              default: module.ClusterIngressesList,
            })),
          ),
        },
        {
          key: 'services',
          title: translate('Services'),
          visible: false,
          component: lazyComponent(() =>
            import('./ClusterServicesList').then((module) => ({
              default: module.ClusterServicesList,
            })),
          ),
        },
      ],
    },

    {
      title: translate('Team'),
      key: 'team',
      component: lazyComponent(() =>
        import('./TeamTable').then((module) => ({
          default: module.TeamTable,
        })),
      ),
      defaultKey: 'resource-access',
      children: [
        {
          key: 'resource-access',
          title: translate('Resource access'),
          visible: false,
          component: lazyComponent(() =>
            import('./team/KeycloakMembershipList').then((module) => ({
              default: module.KeycloakMembershipList,
            })),
          ),
        },
      ],
    },
  ],
};
