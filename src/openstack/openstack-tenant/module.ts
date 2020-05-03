import * as ResourceSummary from '@waldur/resource/summary/registry';

import actionsModule from './actions/module';
import appstoreFieldSelectOpenstackTenant from './appstore-field-select-openstack-tenant';
import openstackTenantsService from './openstack-tenants-service';
import { OpenStackTenantSummary } from './OpenStackTenantSummary';
import './tabs';

export default module => {
  ResourceSummary.register('OpenStack.Tenant', OpenStackTenantSummary);
  module.service('openstackTenantsService', openstackTenantsService);
  module.component(
    'appstoreFieldSelectOpenstackTenant',
    appstoreFieldSelectOpenstackTenant,
  );
  actionsModule(module);
};
