import { translate } from '@waldur/i18n';
import { validateState, createLatinNameField, createDescriptionField } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(_): ResourceAction {
  return {
    key: 'backup',
    type: 'button',
    method: 'POST',
    tab: 'backups',
    title: translate('Create'),
    dialogTitle: translate('Create backup for '),
    iconClass: 'fa fa-plus',
    validators: [validateState('OK')],
    fields: [
      createLatinNameField(),
      createDescriptionField(),
      {
        key: 'kept_until',
        type: 'datetime',
        required: false,
        label: translate('Kept until'),
        help_text: translate('Guaranteed time of backup retention. If null - keep forever.'),
      },
    ],
  };
}
