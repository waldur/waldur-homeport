import openstackSnapshotsService from './openstack-snapshots-service';
import { openstackSnapshotSummary } from './openstack-snapshot-summary';
import openstackSnapshotsList from './openstack-snapshots-list';
import openstackSnapshotsNestedList from './openstack-snapshots-nested-list';
import restoredVolumesList from './openstack-snapshot-restored-volumes-list';

export default module => {
  module.config(tabsConfig);
  module.service('openstackSnapshotsService', openstackSnapshotsService);
  module.component('openstackSnapshotSummary', openstackSnapshotSummary);
  module.component('openstackSnapshotsList', openstackSnapshotsList);
  module.component('openstackSnapshotsNestedList', openstackSnapshotsNestedList);
  module.component('restoredVolumesList', restoredVolumesList);
  module.config(actionConfig);
  module.config(stateConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Snapshot', {
    order: [
      'edit',
      'pull',
      'restore',
      'destroy',
    ],
    options: {
      restore: {
        dialogTitle: gettext('Please provide details of a new volume created from snapshot'),
      },
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Snapshot has been updated'),
        fields: {
          kept_until: {
            help_text: gettext('Guaranteed time of snapshot retention. If null - keep forever.'),
            label: gettext('Kept until'),
            required: false,
            type: 'datetime'
          }
        }
      }),
      pull: {
        title: gettext('Synchronise')
      },
    }
  });
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Snapshot', {
    error_states: [
      'error'
    ]
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Snapshot', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'restored',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      restored: {
        heading: gettext('Restored volumes'),
        component: 'restoredVolumesList',
      },
    })
  });
}
