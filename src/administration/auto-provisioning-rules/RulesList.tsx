import { CheckIcon, MinusIcon } from '@phosphor-icons/react';
import { autoprovisioningRulesList, Rule } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';

import { RuleActions } from './RuleActions';
import { RuleCreateButton } from './RuleCreateButton';
import { RuleExpandableRow } from './RuleExpandableRow';

const BooleanIconBadge = ({ value }) => (
  <Badge variant={value ? 'success' : 'default'} pill outline onlyIcon>
    {value ? (
      <CheckIcon weight="bold" size={12} />
    ) : (
      <MinusIcon weight="bold" size={12} />
    )}
  </Badge>
);

export const RulesList = () => {
  const tableProps = useTable({
    table: 'RulesList',
    fetchData: createFetcher(autoprovisioningRulesList),
  });

  return (
    <Table<Rule>
      {...tableProps}
      columns={[
        {
          title: translate('Rule name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Organization'),
          render: ({ row }) => <>{row.customer_name}</>,
        },
        {
          title: translate('Project role'),
          render: ({ row }) => (
            <RoleField row={{ role_name: row?.project_role_display_name }} />
          ),
        },
        {
          title: translate('Creates resource'),
          render: ({ row }) => <BooleanIconBadge value={!!row.plan} />,
        },
      ]}
      verboseName={translate('rules')}
      rowActions={({ row }) => (
        <RuleActions row={row} refetch={tableProps.fetch} />
      )}
      showPageSizeSelector
      tableActions={<RuleCreateButton refetch={tableProps.fetch} />}
      expandableRow={RuleExpandableRow}
    />
  );
};
