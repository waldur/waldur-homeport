import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { SecurityGroupRuleCell } from './SecurityGroupRuleCell';
import { SecurityGroupRuleHeader } from './SecurityGroupRuleHeader';
import { SecurityGroup } from './types';

interface OpenStackSecurityGroupsDialogProps {
  resolve: {
    securityGroups: SecurityGroup[];
  };
}

export const OpenStackSecurityGroupsTable: FunctionComponent<{
  securityGroups: SecurityGroup[];
}> = ({ securityGroups }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th />
          <SecurityGroupRuleHeader />
        </tr>
      </thead>
      {securityGroups.map((securityGroup, i) => (
        <tbody key={i}>
          {securityGroup.rules.length === 0 ? (
            <tr>
              <td>
                <strong>{securityGroup.name.toUpperCase()}</strong>
                {securityGroup.description && (
                  <div>{securityGroup.description}</div>
                )}
              </td>
            </tr>
          ) : (
            securityGroup.rules.map((rule, index) => (
              <tr key={index}>
                {index === 0 && (
                  <td rowSpan={securityGroup.rules.length}>
                    <strong>{securityGroup.name.toUpperCase()}</strong>
                    {securityGroup.description && (
                      <div>{securityGroup.description}</div>
                    )}
                  </td>
                )}
                <SecurityGroupRuleCell rule={rule} />
              </tr>
            ))
          )}
        </tbody>
      ))}
    </Table>
  );
};

export const OpenStackSecurityGroupsDialog = (
  props: OpenStackSecurityGroupsDialogProps,
) => (
  <ModalDialog title={translate('Security groups details')}>
    {props.resolve.securityGroups.length === 0 &&
      translate('Instance does not have any security groups yet.')}
    {props.resolve.securityGroups.length > 0 && (
      <OpenStackSecurityGroupsTable
        securityGroups={props.resolve.securityGroups}
      />
    )}
  </ModalDialog>
);
