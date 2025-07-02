import { ArrowsOutIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

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
