import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { DestroyFloatingIpAction } from './DestroyFloatingIpAction';
import { PullFloatingIpAction } from './PullFloatingIpAction';
const OpenStackFloatingIpSummary = lazyComponent(
  () => import('./OpenStackFloatingIpSummary'),
  'OpenStackFloatingIpSummary',
);

ActionRegistry.register('OpenStack.FloatingIP', [
  PullFloatingIpAction,
  DestroyFloatingIpAction,
]);

ResourceSummary.register('OpenStack.FloatingIP', OpenStackFloatingIpSummary);
