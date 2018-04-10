import { translate } from '@waldur/i18n';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

import { validateState, validateRuntimeState } from './base';

function validate(ctx: ActionContext): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'SHUTOFF') {
    return translate('Instance is already stopped.');
  }
}

export default function createAction(_): ResourceAction {
  return {
    key: 'stop',
    type: 'button',
    method: 'POST',
    title: translate('Stop'),
    validators: [
      validate,
      validateState('OK'),
      validateRuntimeState('ACTIVE'),
    ],
  };
}
