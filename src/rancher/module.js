import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import './marketplace';
import './provider';
import rancherNodesService from './rancher-nodes-service';
import rancherClusterNodes from './rancher-cluster-nodes';
import { RancherClusterSummary } from './RancherClusterSummary';

export default module => {
  ResourceSummary.register('Rancher.Cluster', RancherClusterSummary);
  module.service('rancherNodesService', rancherNodesService);
  module.component('rancherClusterNodes', rancherClusterNodes);
  module.config(actionsConfig);
  module.config(tabsConfig);
};


// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Rancher.Node', actions);
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('Rancher.Cluster', {
    order: [
      'nodes',
      ...DEFAULT_RESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      nodes: {
        heading: gettext('Nodes'),
        component: 'rancherClusterNodes'
      },
    })
  });
}
