import { $rootScope } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import {
  validateState,
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'create_backup_schedule',
    title: translate('Create'),
    dialogTitle: translate('Create backup schedule for OpenStack instance'),
    tab: 'backup_schedules',
    iconClass: 'fa fa-plus',
    type: 'form',
    method: 'POST',
    validators: [validateState('OK')],
    fields: [
      createNameField(),
      createDescriptionField(),
      {
        name: 'retention_time',
        type: 'integer',
        required: true,
        label: translate('Retention time'),
        help_text: translate(
          'Retention time in days, if 0 - resource will be kept forever',
        ),
        min_value: 0,
        max_value: 2147483647,
      },
      {
        name: 'timezone',
        label: translate('Timezone'),
        type: 'timezone',
      },
      {
        name: 'maximal_number_of_resources',
        type: 'integer',
        required: true,
        label: translate('Maximal number of resources'),
        min_value: 0,
        max_value: 32767,
      },
      {
        name: 'schedule',
        type: 'crontab',
        required: true,
        label: translate('Schedule'),
        maxlength: 15,
      },
      {
        name: 'warning',
        component: 'openstackBackupScheduleWarning',
      },
    ],
    onSuccess() {
      $rootScope.$broadcast('updateBackupScheduleList');
    },
  };
}
