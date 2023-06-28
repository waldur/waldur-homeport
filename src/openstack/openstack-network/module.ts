import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';

const OpenStackNetworkSummary = lazyComponent(
  () => import('./OpenStackNetworkSummary'),
  'OpenStackNetworkSummary',
);

ResourceSummary.register('OpenStack.Network', OpenStackNetworkSummary);
