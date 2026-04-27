import { ShieldPlusIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const SecurityGroupEditorDialog = lazyComponent(() =>
  import('./SecurityGroupEditorDialog').then((module) => ({
    default: module.SecurityGroupEditorDialog,
  })),
);

const validators = [validateState('OK')];

export const SetRulesAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set rules')}
    modalComponent={SecurityGroupEditorDialog}
    dialogSize="xl"
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<ShieldPlusIcon weight="bold" />}
  />
);
