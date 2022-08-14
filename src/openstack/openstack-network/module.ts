import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import './tabs';

const OpenStackNetworkSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackNetworkSummary" */ './OpenStackNetworkSummary'
    ),
  'OpenStackNetworkSummary',
);

ResourceSummary.register('OpenStack.Network', OpenStackNetworkSummary);
