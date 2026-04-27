import { ShieldChevronIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';
import { ActionItemType } from '@/resource/actions/types';

const UpdateSecurityGroupsDialog = lazyComponent(() =>
  import('./UpdateSecurityGroupsDialog').then((module) => ({
    default: module.UpdateSecurityGroupsDialog,
  })),
);

const validators = [validateState('OK')];

export const UpdateSecurityGroupsButton: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    resource={resource}
    title={translate('Update security groups')}
    validators={validators}
    modalComponent={UpdateSecurityGroupsDialog}
    extraResolve={{ refetch }}
    iconNode={<ShieldChevronIcon weight="bold" />}
  />
);
