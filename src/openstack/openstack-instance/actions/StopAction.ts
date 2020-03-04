import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'SHUTOFF') {
    return translate('Instance is already stopped.');
  }
}

export default function createAction(): ResourceAction {
  return {
    name: 'stop',
    type: 'button',
    method: 'POST',
    title: translate('Stop'),
    validators: [validate, validateState('OK'), validateRuntimeState('ACTIVE')],
  };
}
