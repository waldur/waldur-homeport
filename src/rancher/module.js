import actions from './actions';
import './marketplace';
import './provider';
import rancherNodesService from './rancher-nodes-service';
import rancherClusterNodes from './rancher-cluster-nodes';

export default module => {
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
      snapshots: {
        heading: gettext('Nodes'),
        component: 'rancherClusterNodes'
      },
    })
  });
}
