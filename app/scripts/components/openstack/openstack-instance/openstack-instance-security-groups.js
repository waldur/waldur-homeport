import template from './openstack-instance-security-groups.html';
import detailsTemplate from './security-group-details.html';

export default function openstackInstanceSecurityGroups() {
  return {
    restrict: 'E',
    template: template,
    controller: SecurityGroupController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      securityGroups: '='
    }
  };
}

const COMMON_PORTS = {
  22: 'SSH',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  110: 'POP3',
  143: 'IMAP',
  389: 'LDAP',
  443: 'HTTPS',
  465: 'SMTPS',
  993: 'IMAPS',
  995: 'POP3S',
  1433: 'MSSQL',
  3306: 'MYSQL',
  3389: 'RDP',
  5432: 'POSTGRESQL'
};

class SecurityGroupController {
  constructor($uibModal, $scope) {
    this.$uibModal = $uibModal;
    this.$scope = $scope;
    this.securityGroupsString = this.securityGroups.map(function(item) {
      return item.name;
    }).join(', ');
  }

  formatPortRange(rule) {
    if (rule.from_port === -1) {
      return '&mdash;';
    } else if (rule.from_port === rule.to_port) {
      if (COMMON_PORTS[rule.from_port]) {
        return `${rule.from_port} (${COMMON_PORTS[rule.from_port]})`;
      } else {
        return rule.from_port;
      }
    } else {
      return `${rule.from_port} - ${rule.to_port}`;
    }
  }

  securityGroupDetails() {
    this.$uibModal.open({
      template: detailsTemplate,
      scope: this.$scope
    });
  }
}
