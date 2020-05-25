import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import { OpenStackVolumeSummary } from './OpenStackVolumeSummary';

import './marketplace';
import './tabs';

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Volume', {
    error_states: ['error'],
  });
}

export default module => {
  ResourceSummary.register('OpenStackTenant.Volume', OpenStackVolumeSummary);
  ActionConfigurationRegistry.register('OpenStackTenant.Volume', actions);
  module.config(stateConfig);
};
