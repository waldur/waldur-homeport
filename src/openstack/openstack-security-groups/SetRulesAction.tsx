import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const SecurityGroupEditorDialog = lazyComponent(
  () => import('./SecurityGroupEditorDialog'),
  'SecurityGroupEditorDialog',
);

const validators = [validateState('OK')];

export const SetRulesAction = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set rules')}
    modalComponent={SecurityGroupEditorDialog}
    dialogSize="xl"
    resource={resource}
  />
);
