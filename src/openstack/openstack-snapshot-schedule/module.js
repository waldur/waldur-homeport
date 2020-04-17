import * as ResourceSummary from '@waldur/resource/summary/registry';
import { getEventsTab } from '@waldur/resource/tabs/constants';

import { ScheduleSnapshotsList } from '../openstack-snapshot/ScheduleSnapshotsList';

import breadcrumbsConfig from './breadcrumbs';
import { OpenStackSnapshotScheduleSummary } from './OpenStackSnapshotScheduleSummary';

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.SnapshotSchedule', {
    order: ['update', 'activate', 'deactivate', 'destroy'],
    options: {
      update: {
        title: gettext('Edit'),
        successMessage: gettext('Snapshot schedule has been updated.'),
        fields: {
          schedule: {
            type: 'crontab',
          },
          timezone: {
            type: 'timezone',
          },
        },
      },
    },
  });
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register(
    'OpenStackTenant.SnapshotSchedule',
    {
      error_states: ['error'],
    },
  );
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register(
    'OpenStackTenant.SnapshotSchedule',
    () => [
      {
        key: 'snapshots',
        title: translate('Snapshots'),
        component: ScheduleSnapshotsList,
      },
      getEventsTab(),
    ],
  );
}

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.SnapshotSchedule',
    OpenStackSnapshotScheduleSummary,
  );
  module.config(actionConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
  module.config(stateConfig);
};
