import { PlusCircleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const CreateListenerDialog = lazyComponent(() =>
  import('./CreateListenerDialog').then((module) => ({
    default: module.CreateListenerDialog,
  })),
);

const validators = [validateState('OK')];

export const CreateListenerAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Create listener')}
    modalComponent={CreateListenerDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<PlusCircleIcon weight="bold" />}
  />
);
