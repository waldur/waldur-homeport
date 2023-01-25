import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const SecurityGroupEditorDialog = lazyComponent(
  () => import('./SecurityGroupEditorDialog'),
  'SecurityGroupEditorDialog',
);

const validators = [validateState('OK')];

export const SetRulesAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set rules')}
    modalComponent={SecurityGroupEditorDialog}
    dialogSize="xl"
    resource={resource}
    extraResolve={{ refetch }}
  />
);
