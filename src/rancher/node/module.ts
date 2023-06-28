import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import nodeActions from './actions';

const RancherNodeSummary = lazyComponent(
  () => import('./RancherNodeSummary'),
  'RancherNodeSummary',
);

ResourceSummary.register('Rancher.Node', RancherNodeSummary);
ActionRegistry.register('Rancher.Node', nodeActions);
