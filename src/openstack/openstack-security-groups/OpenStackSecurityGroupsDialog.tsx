import { Fragment, FunctionComponent } from 'react';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

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
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead />
          <SecurityGroupRuleHeader />
        </TableRow>
      </TableHeader>
      <TableBody>
        {securityGroups.map((securityGroup, i) => (
          <Fragment key={i}>
            {securityGroup.rules.length === 0 ? (
              <TableRow>
                <TableCell>
                  <strong>{securityGroup.name.toUpperCase()}</strong>
                  {securityGroup.description && (
                    <div>{securityGroup.description}</div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              securityGroup.rules.map((rule, index) => (
                <TableRow key={index}>
                  {index === 0 ? (
                    <TableCell
                      rowSpan={securityGroup.rules.length}
                      className={
                        i === securityGroups.length - 1 ? 'border-0' : undefined
                      }
                    >
                      <strong>{securityGroup.name.toUpperCase()}</strong>
                      {securityGroup.description && (
                        <div>{securityGroup.description}</div>
                      )}
                    </TableCell>
                  ) : (
                    <TableCell className="hidden" />
                  )}
                  <SecurityGroupRuleCell rule={rule as any} />
                </TableRow>
              ))
            )}
          </Fragment>
        ))}
      </TableBody>
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
