import template from './openstack-instance-security-groups.html';

export default function openstackInstanceSecurityGroups() {
  return {
    restrict: 'E',
    template: template,
    controller: SecurityGroupsController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      securityGroups: '='
    }
  }
}

// @ngInject
class SecurityGroupsController {
  constructor() {
    this.init();
  }

  init() {
    let displayGroups = [];
    this.securityGroups.forEach(function(item) {
      let rules = item.rules.map(function(rule) {
        let port = rule.from_port === rule.to_port ?
          `port: ${rule.from_port}` :
          `ports: ${rule.from_port}-${rule.to_port}`;
        return `${rule.protocol}, ${port}, cidr: ${rule.cidr}`
      });
      displayGroups.push({
        name: item.name,
        description: item.description,
        rules: rules
      });
    });
    this.displayGroups = displayGroups;
  }
}
