import { latinName } from '@waldur/resource/actions/constants';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { getEventsTab } from '@waldur/resource/tabs/constants';

import { OpenStackSnapshotSummary } from './OpenStackSnapshotSummary';
import { SnapshotRestoredVolumesList } from './SnapshotRestoredVolumesList';

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Snapshot', {
    order: ['edit', 'pull', 'restore', 'destroy'],
    options: {
      restore: {
        dialogSubtitle: gettext(
          'Please provide details of a new volume created from snapshot.',
        ),
      },
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Snapshot has been updated.'),
        fields: {
          name: latinName,
          kept_until: {
            help_text: gettext(
              'Guaranteed time of snapshot retention. If null - keep forever.',
            ),
            label: gettext('Kept until'),
            required: false,
            type: 'datetime',
          },
        },
      }),
      pull: {
        title: gettext('Synchronise'),
      },
    },
  });
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Snapshot', {
    error_states: ['error'],
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Snapshot', () => [
    {
      key: 'restored',
      title: translate('Restored volumes'),
      component: SnapshotRestoredVolumesList,
    },
    getEventsTab(),
  ]);
}

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.Snapshot',
    OpenStackSnapshotSummary,
  );
  module.config(tabsConfig);
  module.config(actionConfig);
  module.config(stateConfig);
};
