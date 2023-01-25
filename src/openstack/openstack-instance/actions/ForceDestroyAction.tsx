import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionContext, ActionItemType } from '@waldur/resource/actions/types';

const ForceDestroyDialog = lazyComponent(
  () => import('./ForceDestroyDialog'),
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

export const ForceDestroyAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Force destroy')}
    validators={validators}
    modalComponent={ForceDestroyDialog}
    className="text-danger"
    resource={resource}
    extraResolve={{ refetch }}
  />
);
