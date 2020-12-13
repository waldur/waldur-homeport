import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import openstackInstanceFloatingIps from './openstack-instance-floating-ips';
import openstackInstanceNetworks from './openstack-instance-networks';

import './marketplace';
import './tabs';

const OpenStackInstanceSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackInstanceSummary" */ './OpenStackInstanceSummary'
    ),
  'OpenStackInstanceSummary',
);

export default (module) => {
  ResourceSummary.register(
    'OpenStackTenant.Instance',
    OpenStackInstanceSummary,
  );
  module.component('openstackInstanceNetworks', openstackInstanceNetworks);
  module.component(
    'openstackInstanceFloatingIps',
    openstackInstanceFloatingIps,
  );
  ActionConfigurationRegistry.register('OpenStackTenant.Instance', actions);
  ResourceStateConfigurationProvider.register('OpenStackTenant.Instance', {
    error_states: ['ERROR'],
    shutdown_states: ['SHUTOFF', 'STOPPED', 'SUSPENDED'],
  });
};
