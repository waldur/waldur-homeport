import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
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

export default () => {
  ResourceSummary.register('OpenStackTenant.Volume', OpenStackVolumeSummary);
  ActionConfigurationRegistry.register('OpenStackTenant.Volume', actions);
  ResourceStateConfigurationProvider.register('OpenStackTenant.Volume', {
    error_states: ['error'],
  });
};
