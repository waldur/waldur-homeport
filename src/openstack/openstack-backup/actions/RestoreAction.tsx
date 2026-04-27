import { ClockClockwiseIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const BackupRestoreDialog = lazyComponent(() =>
  import('./BackupRestoreDialog').then((module) => ({
    default: module.BackupRestoreDialog,
  })),
);

const validators = [validateState('OK')];

export const RestoreAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Restore')}
    modalComponent={BackupRestoreDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<ClockClockwiseIcon weight="bold" />}
  />
);
