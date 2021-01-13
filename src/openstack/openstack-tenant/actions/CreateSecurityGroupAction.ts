import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const CreateSecurityGroupDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CreateSecurityGroupDialog" */ './CreateSecurityGroupDialog'
    ),
  'CreateSecurityGroupDialog',
);

export default function createAction(): ResourceAction {
  return {
    name: 'create_security_group',
    type: 'form',
    method: 'POST',
    tab: 'security_groups',
    title: translate('Create'),
    component: CreateSecurityGroupDialog,
    iconClass: 'fa fa-plus',
    dialogSize: 'xl',
    validators: [validateState('OK')],
  };
}
