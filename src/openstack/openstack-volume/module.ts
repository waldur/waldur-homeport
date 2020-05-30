import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import { OpenStackVolumeSummary } from './OpenStackVolumeSummary';
import './marketplace';
import './tabs';

export default () => {
  ResourceSummary.register('OpenStackTenant.Volume', OpenStackVolumeSummary);
  ActionConfigurationRegistry.register('OpenStackTenant.Volume', actions);
  ResourceStateConfigurationProvider.register('OpenStackTenant.Volume', {
    error_states: ['error'],
  });
};
