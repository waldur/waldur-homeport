import { ShieldChevronIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const UpdateSecurityGroupsDialog = lazyComponent(() =>
  import('./UpdateSecurityGroupsDialog').then((module) => ({
    default: module.UpdateSecurityGroupsDialog,
  })),
);

const validators = [validateState('OK')];

export const UpdateSecurityGroupsAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionItem
    resource={resource}
    title={translate('Update security groups')}
    validators={validators}
    modalComponent={UpdateSecurityGroupsDialog}
    extraResolve={{ refetch }}
    iconNode={<ShieldChevronIcon weight="bold" />}
  />
);
