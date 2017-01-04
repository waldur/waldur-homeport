import openstackAllocationPool from './openstack-allocation-pool';
import openstackSubnet from './openstack-subnet';
import openstackNetworksService from './openstack-networks-service';
import openstackTenantNetworks from './openstack-tenant-networks';

export default module => {
  module.service('openstackNetworksService', openstackNetworksService);
  module.component('openstackAllocationPool', openstackAllocationPool);
  module.component('openstackSubnet', openstackSubnet);
  module.component('openstackTenantNetworks', openstackTenantNetworks);
  module.config(actionConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStack.Network', {
    order: [
      'edit',
      'pull',
      'create_subnet',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Network has been updated'
      }),
      pull: {
        title: 'Synchronise'
      },
      create_subnet: {
        title: 'Create subnet'
      },
    },
  });
}
