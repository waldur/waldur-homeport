import * as ResourceSummary from '@waldur/resource/summary/registry';

import nodeActions from './actions';
import breadcrumbsConfig from './breadcrumbs';
import rancherClusterNodes from './ClusterNodesList';
import { RancherNodeSummary } from './RancherNodeSummary';
import { tabsConfig } from './tabs';

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Rancher.Node', nodeActions);
}

export default module => {
  ResourceSummary.register('Rancher.Node', RancherNodeSummary);
  module.component('rancherClusterNodes', rancherClusterNodes);
  module.config(tabsConfig);
  module.config(actionsConfig);
  module.run(breadcrumbsConfig);
};
