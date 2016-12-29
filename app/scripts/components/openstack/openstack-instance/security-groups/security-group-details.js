import template from './security-group-details.html';

export default function securityGroupDetails() {
  return {
    restrict: 'E',
    template: template,
    controller: securityGroupDetailsController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
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
  5432: 'POSTGRESQL',
};

class securityGroupDetailsController {
  constructor() {
    this.securityGroups = this.resolve.securityGroups;
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
}
