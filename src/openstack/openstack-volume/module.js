import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import { OpenStackVolumeSummary } from './OpenStackVolumeSummary';
import snapshotCreateDialog from './snapshot-create';
import volumeExtendDialog from './volume-extend';
import './marketplace';
import './tabs';

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Volume', actions);
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Volume', {
    error_states: ['error'],
  });
}

export default module => {
  ResourceSummary.register('OpenStackTenant.Volume', OpenStackVolumeSummary);
  module.directive('volumeExtendDialog', volumeExtendDialog);
  module.directive('snapshotCreateDialog', snapshotCreateDialog);
  module.config(actionsConfig);
  module.config(stateConfig);
};
