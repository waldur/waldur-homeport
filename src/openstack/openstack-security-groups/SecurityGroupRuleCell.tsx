import React from 'react';

import {
  formatSecurityGroupProtocol,
  formatSecurityGroupRuleDirection,
  formatSecurityGroupRulePortRange,
} from '@waldur/openstack/openstack-security-groups/utils';

import { SecurityGroupRule } from '../types';

export const SecurityGroupRuleCell: React.FC<{ rule: SecurityGroupRule }> = ({
  rule,
}) => (
  <>
    <td>{rule.ethertype}</td>
    <td>{formatSecurityGroupRuleDirection(rule)}</td>
    <td>{formatSecurityGroupProtocol(rule)}</td>
    <td>{formatSecurityGroupRulePortRange(rule)}</td>
    <td>{rule.cidr || <>&mdash;</>}</td>
    <td>{rule.remote_group_name || <>&mdash;</>}</td>
    <td>{rule.description || <>&mdash;</>}</td>
  </>
);
