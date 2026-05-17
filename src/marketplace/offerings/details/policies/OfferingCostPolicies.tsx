import { FC, useMemo } from 'react';
import { marketplaceOfferingEstimatedCostPoliciesList } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

import { CostPolicyCreateButton } from './CostPolicyCreateButton';
import { PoliciesTable } from './PoliciesTable';
import { PolicyDeleteAction } from './PolicyDeleteButton';
import { PolicyDuplicateAction } from './PolicyDuplicateAction';

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
    fetchData: createFetcher(marketplaceOfferingEstimatedCostPoliciesList),
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
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <PolicyDuplicateAction
            row={row}
            type="cost"
            offering={offering}
            refetch={tableProps.fetch}
          />
          <PolicyDeleteAction
            row={row}
            type="cost"
            refetch={tableProps.fetch}
          />
        </ActionsDropdown>
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
