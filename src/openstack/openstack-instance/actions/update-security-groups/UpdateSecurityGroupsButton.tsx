import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';
import { ActionItemType } from '@waldur/resource/actions/types';

const UpdateSecurityGroupsDialog = lazyComponent(
  () => import('./UpdateSecurityGroupsDialog'),
  'UpdateSecurityGroupsDialog',
);

const validators = [validateState('OK')];

export const UpdateSecurityGroupsButton: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    resource={resource}
    title={translate('Update security groups')}
    validators={validators}
    modalComponent={UpdateSecurityGroupsDialog}
    extraResolve={{ refetch }}
  />
);
