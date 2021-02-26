import { translate } from '@waldur/i18n';
import { destroyVolume } from '@waldur/openstack/api';
import { validateRuntimeState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionContext } from '@waldur/resource/actions/types';
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

const validators = [validate];

export const DestroyAction = ({ resource }) => (
  <DestroyActionItem
    resource={resource}
    validators={validators}
    apiMethod={destroyVolume}
  />
);
