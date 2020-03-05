import { translate } from '@waldur/i18n';
import {
  createDefaultEditAction,
  createNameField,
  validateState,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { mergeActions } from '@waldur/resource/actions/utils';

export default function createAction(): ResourceAction {
  return mergeActions(createDefaultEditAction(), {
    successMessage: translate('Backup has been updated.'),
    fields: [
      createNameField(),
      createDescriptionField(),
      {
        name: 'kept_until',
        help_text: translate(
          'Guaranteed time of backup retention. If null - keep forever.',
        ),
        label: translate('Kept until'),
        required: false,
        type: 'datetime',
      },
    ],
    validators: [validateState('OK')],
  });
}
