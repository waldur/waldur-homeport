import { ArrowsOutIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const ExtendDiskDialog = lazyComponent(() =>
  import('./ExtendDiskDialog').then((module) => ({
    default: module.ExtendDiskDialog,
  })),
);

const validators = [validateState('OK')];

export const ExtendDiskAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    modalComponent={ExtendDiskDialog}
    title={translate('Extend')}
    validators={validators}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<ArrowsOutIcon weight="bold" />}
  />
);
