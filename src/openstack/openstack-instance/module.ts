import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';

import './marketplace';
import './tabs';

const OpenStackInstanceSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackInstanceSummary" */ './OpenStackInstanceSummary'
    ),
  'OpenStackInstanceSummary',
);

ResourceSummary.register('OpenStackTenant.Instance', OpenStackInstanceSummary);
ActionRegistry.register('OpenStackTenant.Instance', actions);
ResourceStateConfigurationProvider.register('OpenStackTenant.Instance', {
  error_states: ['ERROR'],
  shutdown_states: ['SHUTOFF', 'STOPPED', 'SUSPENDED'],
});
