import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const RestoreSnapshotDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RestoreSnapshotDialog" */ './RestoreSnapshotDialog'
    ),
  'RestoreSnapshotDialog',
);

const validators = [validateState('OK')];

export const RestoreSnapshotAction = ({ resource }) => (
  <DialogActionItem
    title={translate('Restore')}
    validators={validators}
    modalComponent={RestoreSnapshotDialog}
    resource={resource}
  />
);
