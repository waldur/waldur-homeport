import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import {
  formatSecurityGroupProtocol,
  formatSecurityGroupRuleDirection,
  formatSecurityGroupRulePortRange,
} from '@waldur/openstack/openstack-security-groups/utils';

import { SecurityGroup } from './types';

interface OpenStackSecurityGroupsDialogProps extends TranslateProps {
  resolve: {
    securityGroups: SecurityGroup[];
  };
}

export const OpenStackSecurityGroupsDialog = withTranslation(
  (props: OpenStackSecurityGroupsDialogProps) => (
    <ModalDialog title={props.translate('Security groups details')}>
      {props.resolve.securityGroups.length === 0 &&
        props.translate('Instance does not have any security groups yet.')}
      {props.resolve.securityGroups.length > 0 && (
        <Table>
          <thead>
            <tr>
              <th />
              <th>{props.translate('Ethernet type')}</th>
              <th>{props.translate('Direction')}</th>
              <th>{props.translate('IP protocol')}</th>
              <th>{props.translate('Port range')}</th>
              <th>{props.translate('Remote CIDR')}</th>
              <th>{props.translate('Description')}</th>
            </tr>
          </thead>
          {props.resolve.securityGroups.map((securityGroup) => (
            <tbody key={securityGroup.uuid}>
              {securityGroup.rules.map((rule, index) => (
                <tr key={index}>
                  {index === 0 && (
                    <td rowSpan={securityGroup.rules.length}>
                      <strong>{securityGroup.name.toUpperCase()}</strong>
                      {securityGroup.description && (
                        <div>{securityGroup.description}</div>
                      )}
                    </td>
                  )}
                  <td>{rule.ethertype}</td>
                  <td>{formatSecurityGroupRuleDirection(rule)}</td>
                  <td>{formatSecurityGroupProtocol(rule)}</td>
                  <td>{formatSecurityGroupRulePortRange(rule)}</td>
                  <td>{rule.cidr}</td>
                  <td>{rule.description || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </Table>
      )}
    </ModalDialog>
  ),
);
