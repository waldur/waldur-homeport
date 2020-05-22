import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { connectAngularComponent } from '@waldur/store/connect';

import actions from './actions';
import { OpenStackVolumeSummary } from './OpenStackVolumeSummary';
import { SnapshotCreateDialog } from './SnapshotCreateDialog';
import { VolumeExtendDialog } from './VolumeExtendDialog';

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
  module.component(
    'volumeExtendDialog',
    connectAngularComponent(VolumeExtendDialog, ['resolve']),
  );
  module.component(
    'snapshotCreateDialog',
    connectAngularComponent(SnapshotCreateDialog, ['resolve']),
  );
  module.config(stateConfig);
};
