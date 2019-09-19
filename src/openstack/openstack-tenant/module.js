import tabsConfig from './tabs';
import openstackTenantsService from './openstack-tenants-service';
import filtersModule from './filters';
import costPlanningConfig from './cost-planning';
import { OpenStackTenantSummary } from './OpenStackTenantSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import appstoreFieldSelectOpenstackTenant from './appstore-field-select-openstack-tenant';
import actionsModule from './actions/module';

export default module => {
  ResourceSummary.register('OpenStack.Tenant', OpenStackTenantSummary);
  module.config(tabsConfig);
  module.run(costPlanningConfig);
  module.run(registerImportEndpoint);
  module.service('openstackTenantsService', openstackTenantsService);
  module.component('appstoreFieldSelectOpenstackTenant', appstoreFieldSelectOpenstackTenant);
  filtersModule(module);
  actionsModule(module);
};

// @ngInject
function registerImportEndpoint(ImportResourcesEndpointRegistry, ENV) {
  ImportResourcesEndpointRegistry.registerEndpoint(ENV.resourcesTypes.private_clouds, 'OpenStack', 'openstack-tenants');
}
