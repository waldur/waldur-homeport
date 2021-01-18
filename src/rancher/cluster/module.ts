import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
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

ResourceSummary.register('Rancher.Cluster', RancherClusterSummary);
ActionRegistry.register('Rancher.Cluster', clusterActions);
