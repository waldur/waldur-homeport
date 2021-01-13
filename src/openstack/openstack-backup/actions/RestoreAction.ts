import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const BackupRestoreDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "BackupRestoreDialog" */ './BackupRestoreDialog'
    ),
  'BackupRestoreDialog',
);

export default function createAction(): ResourceAction {
  return {
    name: 'restore',
    type: 'form',
    method: 'POST',
    title: translate('Restore'),
    validators: [validateState('OK')],
    component: BackupRestoreDialog,
  };
}
