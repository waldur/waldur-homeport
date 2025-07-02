import { useEffect } from 'react';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import {
  formatSecurityGroupProtocol,
  formatSecurityGroupRuleDirection,
  formatSecurityGroupRulePortRange,
} from './utils';

export const SecurityGroupRulesList = ({
  row,
}: {
  row: OpenStackSecurityGroup;
}) => {
  const tableProps = useTable({
    table: 'SecurityGroupRulesList-' + row.uuid,
    fetchData: () =>
      Promise.resolve({
        rows: row.rules,
      }),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [row]);

  return (
    <ExpandableContainer>
      <Table
        {...tableProps}
        columns={[
          {
            title: translate('Ethernet type'),
            render: ({ row }) => <>{row.ethertype}</>,
          },
          {
            title: translate('Direction'),
            render: ({ row }) => <>{formatSecurityGroupRuleDirection(row)}</>,
          },
          {
            title: translate('IP protocol'),
            render: ({ row }) => <>{formatSecurityGroupProtocol(row)}</>,
          },
          {
            title: translate('Port range'),
            render: ({ row }) => <>{formatSecurityGroupRulePortRange(row)}</>,
          },
          {
            title: translate('Remote CIDR'),
            render: ({ row }) => <>{row.cidr || DASH_ESCAPE_CODE}</>,
          },
          {
            title: translate('Remote security group'),
            render: ({ row }) => (
              <>{row.remote_group_name || DASH_ESCAPE_CODE}</>
            ),
          },
          {
            title: translate('Description'),
            render: ({ row }) => <>{row.description || DASH_ESCAPE_CODE}</>,
          },
        ]}
        verboseName={translate('Rules')}
        hasActionBar={false}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
