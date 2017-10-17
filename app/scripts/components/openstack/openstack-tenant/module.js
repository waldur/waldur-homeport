import actionConfig from './actions';
import tabsConfig from './tabs';
import OpenStackTenantConfig from './openstack-tenant-config';
import openstackTenantCheckoutSummary from './openstack-tenant-checkout-summary';
import openstackTenantChangePackageDialog from './openstack-tenant-change-package';
import openstackTenantRequestCustomFlavour from './openstack-tenant-request-custom-flavour';
import openstackTenantRequestDirectAccess from './openstack-tenant-request-direct-access';
import openstackTenantSummary from './openstack-tenant-summary';
import packageTemplatesService from './package-templates-service';
import openstackPackagesService from './openstack-packages-service';
import openstackTenantChangePackageService from './openstack-tenant-change-package-service';
import openstackFlavorsService from './openstack-flavors-service';
import openstackPrices from './openstack-prices';
import openstackTenantPrices from './openstack-tenant-prices';
import filtersModule from './filters';
import eventsConfig from './events';
import costPlanningConfig from './cost-planning';
import openstackTenantAssignPackageDialog from './openstack-tenant-assign-package-dialog';

export default module => {
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.run(eventsConfig);
  module.run(costPlanningConfig);
  module.run(registerImportEndpoint);
  module.component('openstackTenantAssignPackageDialog', openstackTenantAssignPackageDialog);
  module.component('openstackTenantCheckoutSummary', openstackTenantCheckoutSummary);
  module.component('openstackTenantChangePackageDialog', openstackTenantChangePackageDialog);
  module.component('openstackTenantRequestCustomFlavour', openstackTenantRequestCustomFlavour);
  module.component('openstackTenantRequestDirectAccess', openstackTenantRequestDirectAccess);
  module.component('openstackTenantSummary', openstackTenantSummary);
  module.service('packageTemplatesService', packageTemplatesService);
  module.service('openstackPackagesService', openstackPackagesService);
  module.service('openstackTenantChangePackageService', openstackTenantChangePackageService);
  module.service('openstackFlavorsService', openstackFlavorsService);
  module.component('openstackPrices', openstackPrices);
  module.component('openstackTenantPrices', openstackTenantPrices);
  filtersModule(module);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStack.Tenant', OpenStackTenantConfig);
}

// @ngInject
function registerImportEndpoint(ImportResourcesEndpointRegistry, ENV) {
  ImportResourcesEndpointRegistry.registerEndpoint(ENV.resourcesTypes.private_clouds, 'OpenStack', 'openstack-tenants');
}
