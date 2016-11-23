import OpenStackTenantConfig from './openstack-tenant-config';
import openstackTenantSummary from './openstack-tenant-summary';

export default module => {
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.directive('openstackTenantSummary', openstackTenantSummary);
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
      'destroy'
    ],
    options: {
      create_service: {
        title: 'Create provider',
      },
      pull: {
        title: 'Synchronise'
      }
    }
  });
}
