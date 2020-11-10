import * as React from 'react';

import { translate } from '@waldur/i18n';

import { SecurityGroupRule } from '../types';

import {
  formatSecurityGroupProtocol,
  formatSecurityGroupRulePortRange,
  formatSecurityGroupCIDR,
  formatSecurityGroupRuleDirection,
} from './utils';

interface SecurityGroupRulesListProps {
  resource: {
    rules: SecurityGroupRule[];
  };
}

export const SecurityGroupRulesList: React.FC<SecurityGroupRulesListProps> = ({
  resource,
}) => (
  <div className="table-responsive">
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>{translate('Direction')}</th>
          <th>{translate('IP protocol')}</th>
          <th>{translate('Port range')}</th>
          <th>{translate('Remote CIDR')}</th>
          <th>{translate('Description')}</th>
        </tr>
      </thead>
      <tbody>
        {resource.rules.map((rule, index) => (
          <tr key={index}>
            <td>{formatSecurityGroupRuleDirection(rule)}</td>
            <td>{formatSecurityGroupProtocol(rule)}</td>
            <td>{formatSecurityGroupRulePortRange(rule)}</td>
            <td>{formatSecurityGroupCIDR(rule)}</td>
            <td>{rule.description || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
