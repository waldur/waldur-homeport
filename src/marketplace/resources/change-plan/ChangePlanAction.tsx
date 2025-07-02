import { ArrowsLeftRightIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const ChangePlanDialog = lazyComponent(() =>
  import('./ChangePlanDialog').then((module) => ({
    default: module.ChangePlanDialog,
  })),
);

const validators = [validateState('OK')];

export const ChangePlanAction: ActionItemType = ({ resource, refetch }) =>
  resource.marketplace_resource_uuid !== null ? (
    <DialogActionItem
      validators={validators}
      title={translate('Change plan')}
      dialogSize="lg"
      modalComponent={ChangePlanDialog}
      resource={resource}
      extraResolve={{ refetch }}
      iconNode={<ArrowsLeftRightIcon weight="bold" />}
    />
  ) : null;
