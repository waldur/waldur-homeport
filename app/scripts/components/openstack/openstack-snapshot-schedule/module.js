import openstackSnapshotSchedulesList from './openstack-snapshot-schedules-list';
import openstackSnapshotSchedulesService from './openstack-snapshot-schedules-service';
import openstackSnapshotScheduleSummary from './openstack-snapshot-schedule-summary';
import breadcrumbsConfig from './breadcrumbs';

export default module => {
  module.service('openstackSnapshotSchedulesService', openstackSnapshotSchedulesService);
  module.component('openstackSnapshotSchedulesList', openstackSnapshotSchedulesList);
  module.component('openstackSnapshotScheduleSummary', openstackSnapshotScheduleSummary);
  module.config(actionConfig);
  module.run(breadcrumbsConfig);
  module.config(stateConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.SnapshotSchedule', {
    order: [
      'update',
      'activate',
      'deactivate',
      'destroy',
      'pull'
    ],
    options: {
      update: {
        title: 'Edit',
        successMessage: 'Snapshot schedule has been updated',
        fields: {
          schedule: {
            type: 'crontab'
          }
        }
      },
      pull: {
        title: 'Synchronise'
      },
    }
  });
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.SnapshotSchedule', {
    error_states: [
      'error'
    ]
  });
}
