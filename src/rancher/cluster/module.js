import * as ResourceSummary from '@waldur/resource/summary/registry';

import clusterActions from './actions';
import RancherClusterKubeconfigDialog from './actions/RancherClusterKubeconfigDialog';
import rancherCreateNodeDialog from './create/CreateNodeDialog';
import './create/marketplace';
import { RancherClusterSummary } from './RancherClusterSummary';
import { tabsConfig } from './tabs';

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Rancher.Cluster', clusterActions);
}

export default module => {
  ResourceSummary.register('Rancher.Cluster', RancherClusterSummary);
  module.component(
    'rancherClusterKubeconfigDialog',
    RancherClusterKubeconfigDialog,
  );
  module.component('rancherCreateNodeDialog', rancherCreateNodeDialog);
  module.config(tabsConfig);
  module.config(actionsConfig);
};
