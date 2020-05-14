import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import openstackInstanceCurrentFlavor from './openstack-instance-current-flavor';
import openstackInstanceFloatingIps from './openstack-instance-floating-ips';
import openstackInstanceNetworks from './openstack-instance-networks';
import openstackInstanceSecurityGroupsField from './openstack-instance-security-groups-field';
import { OpenStackInstanceSummary } from './OpenStackInstanceSummary';

import './marketplace';
import './tabs';

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Instance', {
    error_states: ['ERROR'],
    shutdown_states: ['SHUTOFF', 'STOPPED', 'SUSPENDED'],
  });
}

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.Instance',
    OpenStackInstanceSummary,
  );
  module.component(
    'openstackInstanceCurrentFlavor',
    openstackInstanceCurrentFlavor,
  );
  module.component(
    'openstackInstanceSecurityGroupsField',
    openstackInstanceSecurityGroupsField,
  );
  module.component('openstackInstanceNetworks', openstackInstanceNetworks);
  module.component(
    'openstackInstanceFloatingIps',
    openstackInstanceFloatingIps,
  );
  ActionConfigurationRegistry.register('OpenStackTenant.Instance', actions);
  module.config(stateConfig);
};
