import { translate } from '@waldur/i18n';
import { updateSnapshot } from '@waldur/openstack/api';
import {
  validateState,
  createDescriptionField,
  createEditAction,
  createNameField,
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
          'Guaranteed time of volume snapshot retention. If null - keep forever.',
        ),
        label: translate('Kept until'),
        required: false,
        type: 'datetime',
      },
    ],
    validators: [validateState('OK')],
    updateResource: updateSnapshot,
    getInitialValues: () => ({
      name: resource.name,
      description: resource.description,
      kept_until: resource.kept_until,
    }),
    verboseName: translate('Volume snapshot'),
  });
}
