import { translate } from '@waldur/i18n';
import { updateNetwork } from '@waldur/openstack/api';
import {
  createNameField,
  createDescriptionField,
  createEditAction,
  validateState,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction({ resource }): ResourceAction {
  return createEditAction({
    resource,
    fields: [createNameField(), createDescriptionField()],
    validators: [validateState('OK')],
    updateResource: updateNetwork,
    verboseName: translate('network'),
  });
}
