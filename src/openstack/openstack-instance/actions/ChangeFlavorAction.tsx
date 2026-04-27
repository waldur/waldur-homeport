import { SwapIcon } from '@phosphor-icons/react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateOpenStackInstanceManagePermission } from '@/openstack/utils';
import { validateState, validateRuntimeState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionContext, ActionItemType } from '@/resource/actions/types';

const ChangeFlavorDialog = lazyComponent(() =>
  import('./ChangeFlavorDialog').then((module) => ({
    default: module.ChangeFlavorDialog,
  })),
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
  validateOpenStackInstanceManagePermission,
];

export const ChangeFlavorAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Change flavor')}
    modalComponent={ChangeFlavorDialog}
    validators={validators}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<SwapIcon weight="bold" />}
  />
);
