import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'SHUTOFF') {
    return translate('Please start instance first.');
  }
}

export default function createAction(): ResourceAction {
  return {
    name: 'restart',
    type: 'button',
    method: 'POST',
    title: translate('Restart'),
    validators: [validate, validateState('OK'), validateRuntimeState('ACTIVE')],
  };
}
