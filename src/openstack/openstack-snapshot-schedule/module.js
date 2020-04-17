import * as ResourceSummary from '@waldur/resource/summary/registry';

import breadcrumbsConfig from './breadcrumbs';
import { OpenStackSnapshotScheduleSummary } from './OpenStackSnapshotScheduleSummary';
import openstackSnapshotSchedulesList from './SnapshotSchedulesList';

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
function tabsConfig(
  ResourceTabsConfigurationProvider,
  DEFAULT_SUBRESOURCE_TABS,
) {
  ResourceTabsConfigurationProvider.register(
    'OpenStackTenant.SnapshotSchedule',
    {
      order: ['snapshots', ...DEFAULT_SUBRESOURCE_TABS.order],
      options: angular.merge({}, DEFAULT_SUBRESOURCE_TABS.options, {
        snapshots: {
          heading: gettext('Snapshots'),
          component: 'openstackSnapshotsNestedList',
        },
      }),
    },
  );
}

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.SnapshotSchedule',
    OpenStackSnapshotScheduleSummary,
  );
  module.component(
    'openstackSnapshotSchedulesList',
    openstackSnapshotSchedulesList,
  );
  module.config(actionConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
  module.config(stateConfig);
};
