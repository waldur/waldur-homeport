import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateRuntimeState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionContext } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

const DestroyDialog = lazyComponent(
  () => import(/* webpackChunkName: "DestroyDialog" */ './DestroyDialog'),
  'DestroyDialog',
);

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
  <DialogActionItem
    title={translate('Destroy')}
    validators={validators}
    className="text-danger"
    resource={resource}
    modalComponent={DestroyDialog}
  />
);
