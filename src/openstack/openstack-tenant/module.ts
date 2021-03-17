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

ResourceSummary.register('OpenStack.Tenant', OpenStackTenantSummary);
