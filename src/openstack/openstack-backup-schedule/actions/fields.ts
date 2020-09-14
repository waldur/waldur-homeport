import { translate } from '@waldur/i18n';
import { BackupScheduleWarning } from '@waldur/openstack/openstack-backup-schedule/BackupScheduleWarning';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';

export const getFields = () => [
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
  },
  {
    name: 'warning',
    component: BackupScheduleWarning,
  },
];
