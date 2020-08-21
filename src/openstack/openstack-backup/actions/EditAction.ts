import { translate } from '@waldur/i18n';
import { updateBackup } from '@waldur/openstack/api';
import {
  createNameField,
  validateState,
  createDescriptionField,
  createEditAction,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction({ resource }): ResourceAction {
  return createEditAction({
    resource,
    fields: [
      createNameField(),
      createDescriptionField(),
      {
        name: 'kept_until',
        help_text: translate(
          'Guaranteed time of VM snapshot retention. If null - keep forever.',
        ),
        label: translate('Kept until'),
        required: false,
        type: 'datetime',
      },
    ],
    validators: [validateState('OK')],
    updateResource: updateBackup,
    getInitialValues: () => ({
      name: resource.name,
      description: resource.description,
      kept_until: resource.kept_until,
    }),
    verboseName: translate('VM snapshot'),
  });
}
