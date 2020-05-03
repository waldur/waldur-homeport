import * as ResourceSummary from '@waldur/resource/summary/registry';
import { connectAngularComponent } from '@waldur/store/connect';

import clusterActions from './actions';
import { RancherClusterKubeconfigDialog } from './actions/RancherClusterKubeconfigDialog';
import { ApplicationDetailsDialog } from './ApplicationDetailsDialog';
import { CreateNodeDialog } from './create/CreateNodeDialog';
import './create/marketplace';
import { RancherClusterSummary } from './RancherClusterSummary';
import './tabs';

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Rancher.Cluster', clusterActions);
}

export default module => {
  ResourceSummary.register('Rancher.Cluster', RancherClusterSummary);
  module.component(
    'rancherClusterKubeconfigDialog',
    connectAngularComponent(RancherClusterKubeconfigDialog, ['resolve']),
  );
  module.component(
    'rancherCreateNodeDialog',
    connectAngularComponent(CreateNodeDialog, ['resolve']),
  );
  module.component(
    'rancherApplicationDetailsDialog',
    connectAngularComponent(ApplicationDetailsDialog, ['resolve']),
  );
  module.config(actionsConfig);
};
