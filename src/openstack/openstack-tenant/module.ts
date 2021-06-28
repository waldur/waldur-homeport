import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions/module';
import './tabs';

const OpenStackTenantSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackTenantSummary" */ './OpenStackTenantSummary'
    ),
  'OpenStackTenantSummary',
);

const OpenStackRouterSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackRouterSummary" */ './OpenStackRouterSummary'
    ),
  'OpenStackRouterSummary',
);

ResourceSummary.register('OpenStack.Tenant', OpenStackTenantSummary);
ResourceSummary.register('OpenStack.Router', OpenStackRouterSummary);
