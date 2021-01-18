import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionContext } from '@waldur/resource/actions/types';

const DestroyDialog = lazyComponent(
  () => import(/* webpackChunkName: "DestroyDialog" */ './DestroyDialog'),
  'DestroyDialog',
);

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'Erred') {
    return;
  }
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'SHUTOFF') {
    return;
  }
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'ACTIVE') {
    return translate('Please stop the instance before its removal.');
  }
  return translate(
    'Instance should be shutoff and OK or erred. Please contact support.',
  );
}

const validators = [validate];

export const DestroyAction = ({ resource }) => (
  <DialogActionItem
    title={translate('Destroy')}
    validators={validators}
    className="remove"
    resource={resource}
    modalComponent={DestroyDialog}
  />
);
