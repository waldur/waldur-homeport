import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { DestroyPortAction } from './DestroyPortAction';
import './tabs';

const OpenStackTenantSummary = lazyComponent(
  () => import('./OpenStackTenantSummary'),
  'OpenStackTenantSummary',
);

const OpenStackRouterSummary = lazyComponent(
  () => import('./OpenStackRouterSummary'),
  'OpenStackRouterSummary',
);

ResourceSummary.registerCustom('OpenStack.Tenant', OpenStackTenantSummary);
ResourceSummary.register('OpenStack.Router', OpenStackRouterSummary);
ActionRegistry.register('OpenStack.Port', [DestroyPortAction]);
