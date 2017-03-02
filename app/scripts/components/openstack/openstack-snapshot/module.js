import openstackSnapshotsService from './openstack-snapshots-service';
import { openstackSnapshotSummary } from './openstack-snapshot-summary';
import openstackSnapshotsList from './openstack-snapshots-list';

export default module => {
  module.service('openstackSnapshotsService', openstackSnapshotsService);
  module.component('openstackSnapshotSummary', openstackSnapshotSummary);
  module.component('openstackSnapshotsList', openstackSnapshotsList);
  module.config(actionConfig);
  module.config(stateConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Snapshot', {
    order: [
      'edit',
      'pull',
      'destroy',
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Snapshot has been updated',
        fields: {
          kept_until: {
            help_text: 'Guaranteed time of snapshot retention. If null - keep forever.',
            label: 'Kept until',
            required: false,
            type: 'datetime'
          }
        }
      }),
      pull: {
        title: 'Synchronise'
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
