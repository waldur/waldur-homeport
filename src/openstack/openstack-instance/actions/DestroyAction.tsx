import { FileXIcon } from '@phosphor-icons/react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateOpenStackInstanceManagePermission } from '@/openstack/utils';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionContext, ActionItemType } from '@/resource/actions/types';

const DestroyDialog = lazyComponent(() =>
  import('./DestroyDialog').then((module) => ({
    default: module.DestroyDialog,
  })),
);

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'ERRED') {
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

const validators = [validate, validateOpenStackInstanceManagePermission];

export const DestroyAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Destroy')}
    validators={validators}
    className="text-danger"
    resource={resource}
    modalComponent={DestroyDialog}
    extraResolve={{ refetch }}
    iconNode={<FileXIcon weight="bold" />}
    iconColor="danger"
  />
);
