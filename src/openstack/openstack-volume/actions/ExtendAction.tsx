import { ArrowsOutIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

import { isExtendable } from './utils';

const VolumeExtendDialog = lazyComponent(() =>
  import('./ExtendDialog').then((module) => ({
    default: module.VolumeExtendDialog,
  })),
);

const validators = [isExtendable, validateState('OK')];

export const ExtendAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    modalComponent={VolumeExtendDialog}
    title={translate('Extend')}
    validators={validators}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<ArrowsOutIcon weight="bold" />}
  />
);
