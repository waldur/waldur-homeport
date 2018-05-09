import tabsConfig from './tabs';
import OpenStackTenantConfig from './openstack-tenant-config';
import openstackTenantCheckoutSummary from './openstack-tenant-checkout-summary';
import packageTemplatesService from './package-templates-service';
import openstackPackagesService from './openstack-packages-service';
import openstackFlavorsService from './openstack-flavors-service';
import openstackTenantsService from './openstack-tenants-service';
import openstackPrices from './openstack-prices';
import openstackTenantPrices from './openstack-tenant-prices';
import filtersModule from './filters';
import eventsConfig from './events';
import costPlanningConfig from './cost-planning';
import { OpenStackTenantSummary } from './OpenStackTenantSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import appstoreFieldSelectOpenstackTenant from './appstore-field-select-openstack-tenant';
import actionsModule from './actions/module';

export default module => {
  ResourceSummary.register('OpenStack.Tenant', OpenStackTenantSummary);
  module.config(fieldsConfig);
  module.config(tabsConfig);
  module.run(eventsConfig);
  module.run(costPlanningConfig);
  module.run(registerImportEndpoint);
  module.component('openstackTenantCheckoutSummary', openstackTenantCheckoutSummary);
  module.service('packageTemplatesService', packageTemplatesService);
  module.service('openstackPackagesService', openstackPackagesService);
  module.service('openstackFlavorsService', openstackFlavorsService);
  module.service('openstackTenantsService', openstackTenantsService);
  module.component('openstackPrices', openstackPrices);
  module.component('openstackTenantPrices', openstackTenantPrices);
  module.component('appstoreFieldSelectOpenstackTenant', appstoreFieldSelectOpenstackTenant);
  filtersModule(module);
  actionsModule(module);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStack.Tenant', OpenStackTenantConfig);
}

// @ngInject
function registerImportEndpoint(ImportResourcesEndpointRegistry, ENV) {
  ImportResourcesEndpointRegistry.registerEndpoint(ENV.resourcesTypes.private_clouds, 'OpenStack', 'openstack-tenants');
}
