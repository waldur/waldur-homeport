import { ClockClockwiseIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const RestoreSnapshotDialog = lazyComponent(() =>
  import('./RestoreSnapshotDialog').then((module) => ({
    default: module.RestoreSnapshotDialog,
  })),
);

const validators = [validateState('OK')];

export const RestoreSnapshotAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionItem
    title={translate('Restore')}
    validators={validators}
    modalComponent={RestoreSnapshotDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<ClockClockwiseIcon weight="bold" />}
  />
);
