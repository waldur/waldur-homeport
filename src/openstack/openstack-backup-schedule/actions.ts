import { gettext } from '@waldur/i18n';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

ActionConfigurationRegistry.register('OpenStackTenant.BackupSchedule', {
  order: ['update', 'activate', 'deactivate', 'destroy'],
  options: {
    update: {
      title: gettext('Edit'),
      successMessage: gettext('Backup schedule has been updated'),
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
