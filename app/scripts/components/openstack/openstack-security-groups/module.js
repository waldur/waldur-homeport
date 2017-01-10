import openstackSecurityGroupsService from './security-groups-service';
import openstackSecurityGroupsList from './security-groups-list';
import securityGroupsLink from './security-groups-link';
import securityGroupsDialog from './security-groups-dialog';
import { openstackSecurityGroupRulesList } from './security-groups-rules-list';
import { securityGroupRulePort, securityGroupRulePortRange } from './filters';

export default module => {
  module.service('openstackSecurityGroupsService', openstackSecurityGroupsService);
  module.component('openstackSecurityGroupsList', openstackSecurityGroupsList);
  module.component('openstackSecurityGroupRulesList', openstackSecurityGroupRulesList);
  module.directive('securityGroupsLink', securityGroupsLink);
  module.directive('securityGroupsDialog', securityGroupsDialog);
  module.filter('securityGroupRulePort', securityGroupRulePort);
  module.filter('securityGroupRulePortRange', securityGroupRulePortRange);
  module.config(tabsConfig);
};

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStack.SecurityGroup', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'rules',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      rules: {
        heading: 'Rules',
        component: 'openstackSecurityGroupRulesList',
      },
    })
  });
}
