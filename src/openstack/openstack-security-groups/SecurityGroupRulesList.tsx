import * as React from 'react';

import { SecurityGroupRule } from '../types';

import { SecurityGroupRuleCell } from './SecurityGroupRuleCell';
import { SecurityGroupRuleHeader } from './SecurityGroupRuleHeader';

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
          <SecurityGroupRuleHeader />
        </tr>
      </thead>
      <tbody>
        {resource.rules.map((rule, index) => (
          <tr key={index}>
            <SecurityGroupRuleCell rule={rule} />
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
