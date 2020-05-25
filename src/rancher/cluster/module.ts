import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import clusterActions from './actions';
import './create/marketplace';
import { RancherClusterSummary } from './RancherClusterSummary';
import './tabs';

export default () => {
  ResourceSummary.register('Rancher.Cluster', RancherClusterSummary);
  ActionConfigurationRegistry.register('Rancher.Cluster', clusterActions);
};
