import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const BackupRestoreDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "BackupRestoreDialog" */ './BackupRestoreDialog'
    ),
  'BackupRestoreDialog',
);

const validators = [validateState('OK')];

export const RestoreAction = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Restore')}
    modalComponent={BackupRestoreDialog}
    resource={resource}
  />
);
