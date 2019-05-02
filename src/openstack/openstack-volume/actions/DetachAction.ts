import { translate } from '@waldur/i18n';
import { validateRuntimeState, validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

import { isBootable } from './utils';

export default function createAction(): ResourceAction<Volume> {
  return {
    name: 'detach',
    type: 'button',
    method: 'POST',
    title: translate('Detach'),
    validators: [
      isBootable,
      validateRuntimeState('in-use'),
      validateState('OK'),
    ],
  };
}
