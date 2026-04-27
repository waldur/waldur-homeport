import { BracketsSquareIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const SetMtuDialog = lazyComponent(() =>
  import('./SetMtuDialog').then((module) => ({ default: module.SetMtuDialog })),
);

const validators = [validateState('OK')];

export const SetMtuAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set MTU')}
    modalComponent={SetMtuDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<BracketsSquareIcon weight="bold" />}
  />
);
