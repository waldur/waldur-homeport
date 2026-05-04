import { PlusCircleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const CreatePoolDialog = lazyComponent(() =>
  import('./CreatePoolDialog').then((module) => ({
    default: module.CreatePoolDialog,
  })),
);

const validators = [validateState('OK')];

export const CreatePoolAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Create pool')}
    modalComponent={CreatePoolDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<PlusCircleIcon weight="bold" />}
  />
);
