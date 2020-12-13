import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actionsModule from './actions/module';
import './tabs';
const OpenStackTenantSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackTenantSummary" */ './OpenStackTenantSummary'
    ),
  'OpenStackTenantSummary',
);

export default () => {
  ResourceSummary.register('OpenStack.Tenant', OpenStackTenantSummary);
  actionsModule();
};
