import openstackSecurityGroupsService from './security-groups-service';
import openstackSecurityGroupsList from './security-groups-list';
import securityGroupsLink from './security-groups-link';
import securityGroupsDialog from './security-groups-dialog';
import { securityGroupRulePort, securityGroupRulePortRange } from './filters';
import { securityGroupRuleEditor } from './security-group-rule-editor';

export default module => {
  module.service('openstackSecurityGroupsService', openstackSecurityGroupsService);
  module.component('openstackSecurityGroupsList', openstackSecurityGroupsList);
  module.component('securityGroupRuleEditor', securityGroupRuleEditor);
  module.directive('securityGroupsLink', securityGroupsLink);
  module.directive('securityGroupsDialog', securityGroupsDialog);
  module.filter('securityGroupRulePort', securityGroupRulePort);
  module.filter('securityGroupRulePortRange', securityGroupRulePortRange);
  module.config(tabsConfig);
  module.config(actionConfig);
};

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStack.SecurityGroup', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'rules',
    ],
    options: DEFAULT_RESOURCE_TABS.options
  });
}

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStack.SecurityGroup', {
    order: [
      'edit',
      'pull',
      'set_rules',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Security group has been updated'
      }),
      pull: {
        title: 'Synchronise'
      },
      set_rules: {
        title: 'Set rules',
        enabled: true,
        type: 'form',
        fields: {
          rules: {
            component: 'securityGroupRuleEditor',
            resource_default_value: true,
          }
        },
        dialogSize: 'lg',
        serializer: model => model.rules
      }
    }
  });
}
