import * as ResourceSummary from '@waldur/resource/summary/registry';

import clusterActions from './cluster-actions';
import nodeActions from './node-actions';
import './marketplace';
import './provider';
import rancherNodesService from './rancher-nodes-service';
import rancherClusterNodes from './rancher-cluster-nodes';
import RancherClusterKubeconfigDialog from './cluster-actions/RancherClusterKubeconfigDialog';
import { RancherClusterSummary } from './RancherClusterSummary';

export default module => {
  ResourceSummary.register('Rancher.Cluster', RancherClusterSummary);
  module.service('rancherNodesService', rancherNodesService);
  module.component('rancherClusterNodes', rancherClusterNodes);
  module.component('rancherClusterKubeconfigDialog', RancherClusterKubeconfigDialog);
  module.config(actionsConfig);
  module.config(tabsConfig);
};


// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Rancher.Node', nodeActions);
  ActionConfigurationProvider.register('Rancher.Cluster', clusterActions);
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
