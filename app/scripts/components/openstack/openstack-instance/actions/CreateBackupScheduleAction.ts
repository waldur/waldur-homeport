import { translate } from '@waldur/i18n';
import { validateState, createNameField, createDescriptionField } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    key: 'create_backup_schedule',
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
        key: 'retention_time',
        type: 'integer',
        required: true,
        label: translate('Retention time'),
        help_text: translate('Retention time in days, if 0 - resource will be kept forever'),
        min_value: 0,
        max_value: 2147483647,
      },
      {
        key: 'timezone',
        default_value: 'UTC',
        label: translate('Timezone'),
      },
      {
        key: 'maximal_number_of_resources',
        type: 'integer',
        required: true,
        label: translate('Maximal number of resources'),
        min_value: 0,
        max_value: 32767,
      },
      {
        key: 'schedule',
        type: 'crontab',
        required: true,
        label: translate('Schedule'),
        maxlength: 15,
      },
    ],
  };
}
