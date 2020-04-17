import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';

import { ClusterCatalogList } from '../catalog/ClusterCatalogList';
import { ClusterProjectList } from '../ClusterProjectList';
import { ClusterNodesList } from '../node/ClusterNodesList';
import { ClusterTemplatesList } from '../template/ClusterTemplateList';

// @ngInject
export function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('Rancher.Cluster', () => [
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
    ...getDefaultResourceTabs(),
  ]);
}
