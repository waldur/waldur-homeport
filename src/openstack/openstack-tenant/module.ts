import * as ResourceSummary from '@waldur/resource/summary/registry';

import actionsModule from './actions/module';
import { OpenStackTenantSummary } from './OpenStackTenantSummary';
import './tabs';

export default () => {
  ResourceSummary.register('OpenStack.Tenant', OpenStackTenantSummary);
  actionsModule();
};
