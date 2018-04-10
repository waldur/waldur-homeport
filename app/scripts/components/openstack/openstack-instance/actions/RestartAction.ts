import { translate } from '@waldur/i18n';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

import { validateState, validateRuntimeState } from './base';

function validate(ctx: ActionContext): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'SHUTOFF') {
    return translate('Please start instance first.');
  }
}

export default function createAction(_): ResourceAction {
  return {
    key: 'restart',
    type: 'button',
    method: 'POST',
    title: translate('Restart'),
    validators: [
      validate,
      validateState('OK'),
      validateRuntimeState('ACTIVE'),
    ],
  };
}
