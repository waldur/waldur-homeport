import { FC, useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CostPolicyCreateButton } from './CostPolicyCreateButton';
import { PoliciesTable } from './PoliciesTable';
import { PolicyDeleteButton } from './PolicyDeleteButton';

interface OfferingCostPoliciesProps {
  offering: Offering;
}

export const OfferingCostPolicies: FC<OfferingCostPoliciesProps> = ({
  offering,
}) => {
  const filter = useMemo(() => ({ scope_uuid: offering.uuid }), [offering]);
  const tableProps = useTable({
    table: 'OfferingCostPoliciesList',
    filter: filter,
    fetchData: createFetcher('marketplace-offering-estimated-cost-policies'),
  });

  return (
    <PoliciesTable
      {...tableProps}
      columns={[
        {
          title: translate('Cost threshold'),
          render: ({ row }) => <>{defaultCurrency(row.limit_cost)}</>,
        },
      ]}
      verboseName={translate('Cost policies')}
      rowActions={({ row }) => (
        <PolicyDeleteButton row={row} type="cost" refetch={tableProps.fetch} />
      )}
      tableActions={
        <CostPolicyCreateButton
          offering={offering}
          refetch={tableProps.fetch}
        />
      }
    />
  );
};
