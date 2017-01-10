import template from './security-groups-rules-list.html';

export const openstackSecurityGroupRulesList = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class OpenstackSecurityGroupRulesListController {
    $onInit() {
      this.rules = this.resource.rules;
    }
  }
};
