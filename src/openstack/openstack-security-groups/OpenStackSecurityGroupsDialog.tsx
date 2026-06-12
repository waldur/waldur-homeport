import { Fragment, FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { SecurityGroupRuleCell } from './SecurityGroupRuleCell';
import { SecurityGroupRuleHeader } from './SecurityGroupRuleHeader';

interface OpenStackSecurityGroupsDialogProps {
  resolve: {
    securityGroups: Pick<
      OpenStackSecurityGroup,
      'name' | 'description' | 'rules'
    >[];
  };
}

export const OpenStackSecurityGroupsTable: FunctionComponent<{
  securityGroups: Pick<
    OpenStackSecurityGroup,
    'name' | 'description' | 'rules'
  >[];
}> = ({ securityGroups }) => {
  return (
    <Table responsive className="table-row-bordered">
      <thead>
        <tr>
          <th />
          <SecurityGroupRuleHeader />
        </tr>
      </thead>
      <tbody>
        {securityGroups.map((securityGroup, i) => (
          <Fragment key={i}>
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
                  {index === 0 ? (
                    <td
                      rowSpan={securityGroup.rules.length}
                      className={
                        i === securityGroups.length - 1 ? 'border-0' : undefined
                      }
                    >
                      <strong>{securityGroup.name.toUpperCase()}</strong>
                      {securityGroup.description && (
                        <div>{securityGroup.description}</div>
                      )}
                    </td>
                  ) : (
                    <td className="d-none" />
                  )}
                  <SecurityGroupRuleCell rule={rule as any} />
                </tr>
              ))
            )}
          </Fragment>
        ))}
      </tbody>
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
