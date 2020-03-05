import * as ResourceSummary from '@waldur/resource/summary/registry';

import breadcrumbsConfig from './breadcrumbs';
import clusterActions from './cluster-actions';
import nodeActions from './node-actions';
import './marketplace';
import './provider';
import rancherNodesService from './rancher-nodes-service';
import rancherClusterNodes from './rancher-cluster-nodes';
import RancherClusterKubeconfigDialog from './cluster-actions/RancherClusterKubeconfigDialog';
import rancherCreateNodeDialog from './cluster-actions/CreateNodeDialog';
import rancherKeyValueDialog from './RancherKeyValueDialog';
import { RancherClusterSummary } from './RancherClusterSummary';
import { RancherNodeSummary } from './RancherNodeSummary';

export default module => {
  ResourceSummary.register('Rancher.Cluster', RancherClusterSummary);
  ResourceSummary.register('Rancher.Node', RancherNodeSummary);
  module.service('rancherNodesService', rancherNodesService);
  module.component('rancherClusterNodes', rancherClusterNodes);
  module.component(
    'rancherClusterKubeconfigDialog',
    RancherClusterKubeconfigDialog,
  );
  module.component('rancherKeyValueDialog', rancherKeyValueDialog);
  module.component('rancherCreateNodeDialog', rancherCreateNodeDialog);
  module.config(actionsConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
};

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Rancher.Node', nodeActions);
  ActionConfigurationProvider.register('Rancher.Cluster', clusterActions);
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('Rancher.Cluster', {
    order: ['nodes', ...DEFAULT_RESOURCE_TABS.order],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      nodes: {
        heading: gettext('Nodes'),
        component: 'rancherClusterNodes',
      },
    }),
  });
  ResourceTabsConfigurationProvider.register('Rancher.Node', {
    order: [],
    options: {},
  });
}
