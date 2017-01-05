import openstackAllocationPool from './openstack-allocation-pool';
import openstackSubnet from './openstack-subnet';
import openstackNetworksService from './openstack-networks-service';
import openstackSubnetsService from './openstack-subnets-service';
import openstackTenantNetworks from './openstack-tenant-networks';
import openstackSubnetsList from './openstack-subnets-list';
import { SUBNET_OPTIONS } from './constants';

export default module => {
  module.service('openstackNetworksService', openstackNetworksService);
  module.service('openstackSubnetsService', openstackSubnetsService);
  module.component('openstackAllocationPool', openstackAllocationPool);
  module.component('openstackSubnet', openstackSubnet);
  module.component('openstackTenantNetworks', openstackTenantNetworks);
  module.component('openstackSubnetsList', openstackSubnetsList);
  module.config(actionConfig);
  module.config(tabsConfig);
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
        title: 'Create subnet',
        fields: angular.extend({}, DEFAULT_EDIT_ACTION.fields, SUBNET_OPTIONS)
      },
    },
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStack.Network', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'subnets',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      subnets: {
        heading: 'Subnets',
        component: 'openstackSubnetsList',
      },
    })
  });
}
