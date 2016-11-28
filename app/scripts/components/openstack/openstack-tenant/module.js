import OpenStackTenantConfig from './openstack-tenant-config';
import openstackTenantSummary from './openstack-tenant-summary';
import openstackTenantChangePackageDialog from './openstack-tenant-change-package';
import packageTemplatesService from './package-templates-service';
import openstackPackagesService from './openstack-packages-service';

export default module => {
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.directive('openstackTenantSummary', openstackTenantSummary);
  module.directive('openstackTenantChangePackageDialog', openstackTenantChangePackageDialog);
  module.service('packageTemplatesService', packageTemplatesService);
  module.service('openstackPackagesService', openstackPackagesService);
}

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStack.Tenant', OpenStackTenantConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      'pull',
      'create_service',
      'change_package',
      'destroy'
    ],
    options: {
      create_service: {
        title: 'Create provider',
      },
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
    }
  });
}
