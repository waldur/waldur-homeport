import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import './marketplace';
import './tabs';
const OpenStackVolumeSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackVolumeSummary" */ './OpenStackVolumeSummary'
    ),
  'OpenStackVolumeSummary',
);

ResourceSummary.register('OpenStackTenant.Volume', OpenStackVolumeSummary);
ActionRegistry.register('OpenStackTenant.Volume', actions);
ResourceStateConfigurationProvider.register('OpenStackTenant.Volume', {
  error_states: ['error'],
});
