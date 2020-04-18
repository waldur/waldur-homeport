import { translate } from '@waldur/i18n';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { getEventsTab } from '@waldur/resource/tabs/constants';

import { BackupsList } from '../openstack-backup/BackupsList';

import openstackBackupScheduleWarning from './BackupScheduleWarning';
import breadcrumbsConfig from './breadcrumbs';
import { OpenStackBackupScheduleSummary } from './OpenStackBackupScheduleSummary';

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.BackupSchedule', {
    order: ['update', 'activate', 'deactivate', 'destroy'],
    options: {
      update: {
        title: translate('Edit'),
        successMessage: translate('Backup schedule has been updated'),
        fields: {
          schedule: {
            type: 'crontab',
          },
          timezone: {
            type: 'timezone',
          },
          warning: {
            component: 'openstackBackupScheduleWarning',
          },
        },
      },
    },
  });
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register(
    'OpenStackTenant.BackupSchedule',
    {
      error_states: ['error'],
    },
  );
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register(
    'OpenStackTenant.BackupSchedule',
    () => [
      {
        key: 'backups',
        title: translate('Backups'),
        component: BackupsList,
      },
      getEventsTab(),
    ],
  );
}

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.BackupSchedule',
    OpenStackBackupScheduleSummary,
  );
  module.component(
    'openstackBackupScheduleWarning',
    openstackBackupScheduleWarning,
  );
  module.config(actionConfig);
  module.config(tabsConfig);
  module.config(stateConfig);
  module.run(breadcrumbsConfig);
};
