import { translate } from '@waldur/i18n';
import {
  createDefaultEditAction,
  createLatinNameField,
  validateState,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { mergeActions } from '@waldur/resource/actions/utils';

export default function createAction(): ResourceAction {
  return mergeActions(createDefaultEditAction(), {
    successMessage: translate('Instance has been updated.'),
    fields: [createLatinNameField()],
    validators: [validateState('OK')],
  });
}
