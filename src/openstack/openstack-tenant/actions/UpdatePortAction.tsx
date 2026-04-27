import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const UpdatePortDialog = lazyComponent(() =>
  import('./UpdatePortDialog').then((module) => ({
    default: module.UpdatePortDialog,
  })),
);

const validators = [validateState('OK')];

export const UpdatePortAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Update IP')}
    iconNode={<PencilSimpleIcon weight="bold" />}
    modalComponent={UpdatePortDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
