import { latinName } from '@waldur/resource/actions/constants';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import openstackSnapshotsList from './openstack-snapshots-list';
import { OpenStackSnapshotSummary } from './OpenStackSnapshotSummary';
import openstackSnapshotsNestedList from './ScheduleSnapshotsList';
import restoredVolumesList from './SnapshotRestoredVolumesList';

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
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Snapshot', {
    order: ['restored', ...DEFAULT_RESOURCE_TABS.order],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      restored: {
        heading: gettext('Restored volumes'),
        component: 'restoredVolumesList',
      },
    }),
  });
}

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.Snapshot',
    OpenStackSnapshotSummary,
  );
  module.config(tabsConfig);
  module.component('openstackSnapshotsList', openstackSnapshotsList);
  module.component(
    'openstackSnapshotsNestedList',
    openstackSnapshotsNestedList,
  );
  module.component('restoredVolumesList', restoredVolumesList);
  module.config(actionConfig);
  module.config(stateConfig);
};
