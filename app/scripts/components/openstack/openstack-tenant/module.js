import OpenStackTenantConfig from './openstack-tenant-config';
import openstackTenantSummary from './openstack-tenant-summary';
import openstackTenantChangePackageDialog from './openstack-tenant-change-package';
import packageTemplatesService from './package-templates-service';
import openstackPackagesService from './openstack-packages-service';
import openstackTenantChangePackageService from './openstack-tenant-change-package-service';
import openstackAllocationPool from './openstack-allocation-pool';
import openstackSubnet from './openstack-subnet';

export default module => {
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.directive('openstackTenantSummary', openstackTenantSummary);
  module.directive('openstackTenantChangePackageDialog', openstackTenantChangePackageDialog);
  module.service('packageTemplatesService', packageTemplatesService);
  module.service('openstackPackagesService', openstackPackagesService);
  module.service('openstackTenantChangePackageService', openstackTenantChangePackageService);
  module.component('openstackAllocationPool', openstackAllocationPool);
  module.component('openstackSubnet', openstackSubnet);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStack.Tenant', OpenStackTenantConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      'edit',
      'pull',
      'change_package',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Tenant has been updated'
      }),
      pull: {
        title: 'Synchronise'
      },
      change_package: {
        title: 'Change VPC package',
        enabled: true,
        type: 'form',
        component: 'openstackTenantChangePackageDialog',
        dialogSize: 'lg'
      }
    },
    delete_message: 'All tenant resources will be deleted.'
  });
}
