import * as React from 'react';

import { translate } from '@waldur/i18n';

import {
  formatSecurityGroupProtocol,
  formatSecurityGroupRulePortRange,
  formatSecurityGroupCIDR,
} from './utils';

export const SecurityGroupRulesList = ({ resource }) => (
  <div className="table-responsive">
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>{translate('IP protocol')}</th>
          <th>{translate('Port range')}</th>
          <th>{translate('Remote CIDR')}</th>
          <th>{translate('Description')}</th>
        </tr>
      </thead>
      <tbody>
        {resource.rules.map((rule, index) => (
          <tr key={index}>
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
