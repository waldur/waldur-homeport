import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionContext } from '@waldur/resource/actions/types';

const ForceDestroyDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "ForceDestroyDialog" */ './ForceDestroyDialog'),
  'ForceDestroyDialog',
);

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'Erred') {
    return;
  }
  if (ctx.resource.state === 'OK') {
    return;
  }
  return translate('Instance should be OK, or erred. Please contact support.');
}

const validators = [validate];

export const ForceDestroyAction = ({ resource }) => (
  <DialogActionItem
    title={translate('Force destroy')}
    validators={validators}
    modalComponent={ForceDestroyDialog}
    className="remove"
    resource={resource}
  />
);
