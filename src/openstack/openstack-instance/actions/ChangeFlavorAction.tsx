import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionContext } from '@waldur/resource/actions/types';

const ChangeFlavorDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "ChangeFlavorDialog" */ './ChangeFlavorDialog'),
  'ChangeFlavorDialog',
);

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'ACTIVE') {
    return translate('Please stop the instance before changing its flavor.');
  }
}

const validators = [
  validate,
  validateState('OK'),
  validateRuntimeState('SHUTOFF'),
];

export const ChangeFlavorAction = ({ resource }) => (
  <DialogActionItem
    title={translate('Change flavor')}
    modalComponent={ChangeFlavorDialog}
    validators={validators}
    resource={resource}
  />
);
