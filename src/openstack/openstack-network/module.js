import { translate } from '@waldur/i18n';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { getEventsTab } from '@waldur/resource/tabs/constants';

import { NetworkSubnetsList } from '../openstack-subnet/NetworkSubnetsList';

import breadcrumbsConfig from './breadcrumbs';
import { formatAllocationPool } from './filters';
import openstackAllocationPool from './openstack-allocation-pool';
import { OpenStackNetworkSummary } from './OpenStackNetworkSummary';

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

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('OpenStack.Network', () => [
    {
      key: 'subnets',
      title: translate('Subnets'),
      component: NetworkSubnetsList,
    },
    getEventsTab(),
  ]);
}

export default module => {
  ResourceSummary.register('OpenStack.Network', OpenStackNetworkSummary);
  module.component('openstackAllocationPool', openstackAllocationPool);
  module.filter('formatAllocationPool', formatAllocationPool);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
};
