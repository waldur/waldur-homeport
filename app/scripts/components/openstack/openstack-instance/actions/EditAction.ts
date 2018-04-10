import { translate } from '@waldur/i18n';
import { ResourceAction } from '@waldur/resource/actions/types';

import { createDefaultEditAction, createLatinNameField, validateState } from './base';
import { mergeActions } from './utils';

export default function createAction(_): ResourceAction {
  return mergeActions(createDefaultEditAction(), {
    successMessage: translate('Instance has been updated.'),
    fields: [createLatinNameField()],
    validators: [validateState('OK')],
  });
}
