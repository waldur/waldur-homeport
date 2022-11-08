import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';

const OpenStackServerGroupSummary = lazyComponent(
  () => import('./OpenStackServerGroupSummary'),
  'OpenStackServerGroupSummary',
);

ResourceSummary.register('OpenStack.ServerGroup', OpenStackServerGroupSummary);
