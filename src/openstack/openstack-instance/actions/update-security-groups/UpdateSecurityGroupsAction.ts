import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const UpdateSecurityGroupsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UpdateSecurityGroupsDialog" */ './UpdateSecurityGroupsDialog'
    ),
  'UpdateSecurityGroupsDialog',
);

export default function createAction(): ResourceAction {
  return {
    name: 'update_security_groups',
    title: translate('Update security groups'),
    type: 'form',
    method: 'POST',
    validators: [validateState('OK')],
    component: UpdateSecurityGroupsDialog,
  };
}
