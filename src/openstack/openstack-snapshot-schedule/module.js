import openstackSnapshotSchedulesList from './openstack-snapshot-schedules-list';
import openstackSnapshotSchedulesService from './openstack-snapshot-schedules-service';
import breadcrumbsConfig from './breadcrumbs';
import { OpenStackSnapshotScheduleSummary } from './OpenStackSnapshotScheduleSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('OpenStackTenant.SnapshotSchedule', OpenStackSnapshotScheduleSummary);
  module.service('openstackSnapshotSchedulesService', openstackSnapshotSchedulesService);
  module.component('openstackSnapshotSchedulesList', openstackSnapshotSchedulesList);
  module.config(actionConfig);
  module.config(tabsConfig);
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
        title: gettext('Edit'),
        successMessage: gettext('Snapshot schedule has been updated.'),
        fields: {
          schedule: {
            type: 'crontab'
          },
          timezone: {
            type: 'timezone',
          },
        }
      },
      pull: {
        title: gettext('Synchronise')
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


// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_SUBRESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.SnapshotSchedule', {
    order: [
      ...DEFAULT_SUBRESOURCE_TABS.order,
      'snapshots',
    ],
    options: angular.merge({}, DEFAULT_SUBRESOURCE_TABS.options, {
      snapshots: {
        heading: gettext('Snapshots'),
        component: 'openstackSnapshotsNestedList'
      },
    })
  });
}
