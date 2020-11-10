import { translate } from '@waldur/i18n';

import { SecurityGroupRule } from '../types';

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

export const formatSecurityGroupCIDR = (rule: SecurityGroupRule) =>
  !rule.cidr ? translate('Any') : rule.cidr;

export const formatSecurityGroupProtocol = (rule: SecurityGroupRule) =>
  !rule.protocol ? translate('Any') : rule.protocol.toUpperCase();

export const formatSecurityGroupRulePort = (input: number) => {
  if (COMMON_PORTS[input]) {
    return `${input} (${COMMON_PORTS[input]})`;
  }
  return input;
};

export const formatSecurityGroupRulePortRange = (rule: SecurityGroupRule) => {
  if (rule.from_port === -1 || !rule.from_port) {
    return translate('Any');
  } else if (rule.from_port === rule.to_port) {
    return formatSecurityGroupRulePort(rule.from_port);
  } else {
    return `${rule.from_port} - ${rule.to_port}`;
  }
};

export const formatSecurityGroupRuleDirection = (rule: SecurityGroupRule) =>
  rule.direction === 'ingress' ? translate('Ingress') : translate('Egress');
