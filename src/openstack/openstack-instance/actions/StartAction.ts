import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'ACTIVE') {
    return translate('Instance is already active.');
  }
}

export default function createAction(): ResourceAction {
  return {
    name: 'start',
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
