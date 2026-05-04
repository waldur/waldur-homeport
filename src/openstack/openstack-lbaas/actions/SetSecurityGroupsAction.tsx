import { ShieldIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const SetSecurityGroupsDialog = lazyComponent(() =>
  import('./SetSecurityGroupsDialog').then((m) => ({
    default: m.SetSecurityGroupsDialog,
  })),
);

const validators = [validateState('OK')];

export const SetSecurityGroupsAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set security groups')}
    modalComponent={SetSecurityGroupsDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<ShieldIcon weight="bold" />}
  />
);
