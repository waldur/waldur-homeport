import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const RestoreSnapshotDialog = lazyComponent(
  () => import('./RestoreSnapshotDialog'),
  'RestoreSnapshotDialog',
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
  />
);
