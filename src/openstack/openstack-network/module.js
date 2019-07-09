import openstackAllocationPool from './openstack-allocation-pool';
import openstackNetworksService from './openstack-networks-service';
import openstackTenantNetworks from './openstack-tenant-networks';
import { formatAllocationPool } from './filters';
import breadcrumbsConfig from './breadcrumbs';
import { OpenStackNetworkSummary } from './OpenStackNetworkSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('OpenStack.Network', OpenStackNetworkSummary);
  module.service('openstackNetworksService', openstackNetworksService);
  module.component('openstackAllocationPool', openstackAllocationPool);
  module.component('openstackTenantNetworks', openstackTenantNetworks);
  module.filter('formatAllocationPool', formatAllocationPool);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
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
        successMessage: gettext('Network has been updated.')
      }),
      pull: {
        title: gettext('Synchronise')
      },
      create_subnet: {
        title: gettext('Create subnet'),
        fields: angular.extend({}, DEFAULT_EDIT_ACTION.fields, {
          cidr: {
            component: 'openstackSubnet',
            label: gettext('Internal network mask (CIDR)'),
            default_value: 42,
            mask: '192.168.X.0/24',
            serializer: (value, field) => field.mask.replace('X', value)
          },
          allocation_pool: {
            component: 'openstackAllocationPool',
            label: gettext('Internal network allocation pool'),
            range: '192.168.X.10 — 192.168.X.200',
            parentField: 'cidr'
          },
          gateway_ip: {
            type: 'string',
            required: false,
            label: gettext('Gateway IP of this subnet'),
          },
          disable_gateway: {
            type: 'boolean',
            required: false,
            label: gettext('Do not configure a gateway for this subnet'),
          },
        })
      },
    },
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_SUBRESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStack.Network', {
    order: [
      'subnets',
      ...DEFAULT_SUBRESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_SUBRESOURCE_TABS.options, {
      subnets: {
        heading: 'Subnets',
        component: 'openstackSubnetsList',
      },
    })
  });
}
