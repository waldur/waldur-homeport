import { XIcon } from '@phosphor-icons/react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionContext, ActionItemType } from '@waldur/resource/actions/types';

const ForceDestroyDialog = lazyComponent(() =>
  import('./ForceDestroyDialog').then((module) => ({
    default: module.ForceDestroyDialog,
  })),
);

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'ERRED') {
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
    iconNode={<XIcon weight="bold" />}
    iconColor="danger"
  />
);
