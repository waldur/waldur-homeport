import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import clusterActions from './actions';
import './create/marketplace';
import './tabs';
const RancherClusterSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RancherClusterSummary" */ './RancherClusterSummary'
    ),
  'RancherClusterSummary',
);

export default () => {
  ResourceSummary.register('Rancher.Cluster', RancherClusterSummary);
  ActionConfigurationRegistry.register('Rancher.Cluster', clusterActions);
};
