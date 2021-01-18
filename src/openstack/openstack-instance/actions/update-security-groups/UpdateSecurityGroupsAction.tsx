import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const UpdateSecurityGroupsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UpdateSecurityGroupsDialog" */ './UpdateSecurityGroupsDialog'
    ),
  'UpdateSecurityGroupsDialog',
);

const validators = [validateState('OK')];

export const UpdateSecurityGroupsAction = ({ resource }) => (
  <DialogActionItem
    resource={resource}
    title={translate('Update security groups')}
    validators={validators}
    modalComponent={UpdateSecurityGroupsDialog}
  />
);
