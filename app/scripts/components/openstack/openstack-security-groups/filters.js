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

export function securityGroupRulePort() {
  return function(input) {
    if (COMMON_PORTS[input]) {
      return `${input} (${COMMON_PORTS[input]})`;
    }
    return input;
  };
}

// @ngInject
export function securityGroupRulePortRange($filter) {
  return function formatPortRange(rule) {
    if (rule.from_port === -1 || !rule.from_port) {
      return gettext('Any');
    } else if (rule.from_port === rule.to_port) {
      return $filter('securityGroupRulePort')(rule.from_port);
    } else {
      return `${rule.from_port} - ${rule.to_port}`;
    }
  };
}

export function securityGroupProtocol() {
  return function(rule) {
    if (!rule.protocol) {
      return gettext('Any');
    } else {
      return rule.protocol.toUpperCase();
    }
  };
}

export function securityGroupCIDR() {
  return function(rule) {
    if (!rule.cidr) {
      return gettext('Any');
    } else {
      return rule.cidr;
    }
  };
}

export default module => {
  module.filter('securityGroupRulePort', securityGroupRulePort);
  module.filter('securityGroupRulePortRange', securityGroupRulePortRange);
  module.filter('securityGroupCIDR', securityGroupCIDR);
  module.filter('securityGroupProtocol', securityGroupProtocol);
};
