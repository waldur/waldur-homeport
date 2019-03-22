import { $rootScope } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { validateState, createLatinNameField, createDescriptionField } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'create_security_group',
    type: 'form',
    method: 'POST',
    tab: 'security_groups',
    title: translate('Create'),
    dialogTitle: translate('Create security group for OpenStack tenant'),
    iconClass: 'fa fa-plus',
    fields: [
      createLatinNameField(),
      createDescriptionField(),
      {
        name: 'rules',
        component: 'securityGroupRuleEditor',
      },
    ],
    serializer: form => {
      return {
        name: form.name,
        description: form.description,
        rules: form.rules.map(rule => ({
          ...rule,
          protocol: rule.protocol === null ? '' : rule.protocol,
        })),
      };
    },
    onSuccess: () => $rootScope.$broadcast('refreshSecurityGroupsList'),
    dialogSize: 'lg',
    validators: [validateState('OK')],
  };
}
