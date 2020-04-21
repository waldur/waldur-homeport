import * as ResourceSummary from '@waldur/resource/summary/registry';

import breadcrumbsConfig from './breadcrumbs';
import { formatAllocationPool } from './filters';
import openstackAllocationPool from './openstack-allocation-pool';
import { OpenStackNetworkSummary } from './OpenStackNetworkSummary';
import './tabs';

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStack.Network', {
    order: ['edit', 'pull', 'create_subnet', 'destroy'],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Network has been updated.'),
      }),
      pull: {
        title: gettext('Synchronise'),
      },
      create_subnet: {
        title: gettext('Create subnet'),
        fields: angular.extend({}, DEFAULT_EDIT_ACTION.fields, {
          cidr: {
            component: 'openstackSubnet',
            label: gettext('Internal network mask (CIDR)'),
            default_value: '192.168.42.0/24',
          },
          allocation_pool: {
            component: 'openstackAllocationPool',
            label: gettext('Internal network allocation pool'),
            parentField: 'cidr',
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
        }),
      },
    },
  });
}

export default module => {
  ResourceSummary.register('OpenStack.Network', OpenStackNetworkSummary);
  module.component('openstackAllocationPool', openstackAllocationPool);
  module.filter('formatAllocationPool', formatAllocationPool);
  module.config(actionConfig);
  module.run(breadcrumbsConfig);
};
