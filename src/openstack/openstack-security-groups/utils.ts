import { translate } from '@waldur/i18n';

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

export const formatSecurityGroupCIDR = rule =>
  !rule.cidr ? translate('Any') : rule.cidr;

export const formatSecurityGroupProtocol = rule =>
  !rule.protocol ? translate('Any') : rule.protocol.toUpperCase();

export const formatSecurityGroupRulePort = input => {
  if (COMMON_PORTS[input]) {
    return `${input} (${COMMON_PORTS[input]})`;
  }
  return input;
};

export const formatSecurityGroupRulePortRange = rule => {
  if (rule.from_port === -1 || !rule.from_port) {
    return translate('Any');
  } else if (rule.from_port === rule.to_port) {
    return formatSecurityGroupRulePort(rule.from_port);
  } else {
    return `${rule.from_port} - ${rule.to_port}`;
  }
};
