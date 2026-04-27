import React from 'react';
import { OpenStackSecurityGroupRuleCreate } from 'waldur-js-client';

import {
  formatSecurityGroupProtocol,
  formatSecurityGroupRuleDirection,
  formatSecurityGroupRulePortRange,
} from '@/openstack/openstack-security-groups/utils';

export const SecurityGroupRuleCell: React.FC<{
  rule: OpenStackSecurityGroupRuleCreate;
}> = ({ rule }) => (
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
