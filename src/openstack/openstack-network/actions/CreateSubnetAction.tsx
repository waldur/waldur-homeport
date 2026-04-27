import { PlusSquareIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const CreateSubnetDialog = lazyComponent(() =>
  import('./CreateSubnetDialog').then((module) => ({
    default: module.CreateSubnetDialog,
  })),
);

const validators = [validateState('OK')];

export const CreateSubnetAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Create subnet')}
    modalComponent={CreateSubnetDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<PlusSquareIcon weight="bold" />}
  />
);
