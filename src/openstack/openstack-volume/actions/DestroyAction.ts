import { translate } from '@waldur/i18n';
import { validateRuntimeState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

function validate(ctx: ActionContext<Volume>): string {
  if (ctx.resource.state === 'Erred') {
    return;
  }
  if (ctx.resource.state !== 'OK') {
    return translate('Volume should be in OK state.');
  }
  return validateRuntimeState(
    'available',
    'error',
    'error_restoring',
    'error_extending',
    '',
  )(ctx);
}

export default function createAction(): ResourceAction<Volume> {
  return {
    name: 'destroy',
    type: 'form',
    method: 'DELETE',
    destructive: true,
    title: translate('Destroy'),
    validators: [validate],
  };
}
