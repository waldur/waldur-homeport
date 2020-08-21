import { translate } from '@waldur/i18n';
import { updateInstance } from '@waldur/openstack/api';
import {
  createLatinNameField,
  validateState,
  createEditAction,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction({ resource }): ResourceAction {
  return createEditAction({
    resource,
    fields: [createLatinNameField(), createDescriptionField()],
    validators: [validateState('OK')],
    verboseName: translate('OpenStack instance'),
    updateResource: updateInstance,
  });
}
