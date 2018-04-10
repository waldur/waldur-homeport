import { translate } from '@waldur/i18n';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

import { validateState, validateRuntimeState } from './base';

function validate(ctx: ActionContext): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'ACTIVE') {
    return translate('Instance is already active.');
  }
}

export default function createAction(_): ResourceAction {
  return {
    key: 'start',
    type: 'button',
    method: 'POST',
    title: translate('Start'),
    validators: [
      validate,
      validateState('OK'),
      validateRuntimeState('SHUTOFF'),
    ],
  };
}
