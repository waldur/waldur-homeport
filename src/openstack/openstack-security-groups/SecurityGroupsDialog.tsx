import * as React from 'react';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';

import { translate } from '@waldur/i18n';

import {
  formatSecurityGroupProtocol,
  formatSecurityGroupRulePortRange,
} from './utils';

export const SecurityGroupsDialog = ({ resolve: { securityGroups } }) => (
  <>
    <ModalHeader>
      <ModalTitle>{translate('Security groups details')}</ModalTitle>
    </ModalHeader>
    <ModalBody>
      {securityGroups.length === 0 ? (
        <>{translate('Instance does not have any security groups yet.')}</>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>{translate('IP protocol')}</th>
              <th>{translate('Port range')}</th>
              <th>{translate('Remote network')}</th>
              <th>{translate('Description')}</th>
            </tr>
          </thead>
          {securityGroups.map((securityGroup, securityGroupIndex) => (
            <tbody key={securityGroupIndex}>
              {securityGroup.rules.map((rule, ruleIndex) => (
                <tr key={ruleIndex}>
                  {ruleIndex === 0 && (
                    <td rowSpan={securityGroup.rules.length}>
                      <strong>{securityGroup.name.toUpperCase()}</strong>
                      {securityGroup.description && (
                        <div>({securityGroup.description})</div>
                      )}
                    </td>
                  )}

                  <td>{formatSecurityGroupProtocol(rule)}</td>
                  <td>{formatSecurityGroupRulePortRange(rule)}</td>
                  <td>
                    {rule.cidr} ({translate('CIDR')})
                  </td>
                  <td>{rule.description || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      )}
    </ModalBody>
  </>
);
