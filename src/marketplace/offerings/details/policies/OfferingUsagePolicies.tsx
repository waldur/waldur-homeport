import { FC, useMemo } from 'react';
import { marketplaceOfferingUsagePoliciesList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

import { PoliciesTable } from './PoliciesTable';
import { PolicyDeleteAction } from './PolicyDeleteButton';
import { PolicyDuplicateAction } from './PolicyDuplicateAction';
import { UsagePolicyCreateButton } from './UsagePolicyCreateButton';

interface OfferingUsagePoliciesProps {
  offering: Offering;
}

export const OfferingUsagePolicies: FC<OfferingUsagePoliciesProps> = ({
  offering,
}) => {
  const filter = useMemo(() => ({ scope_uuid: offering.uuid }), [offering]);
  const tableProps = useTable({
    table: 'OfferingUsagePoliciesList',
    filter: filter,
    fetchData: createFetcher(marketplaceOfferingUsagePoliciesList),
    queryField: 'query',
  });

  return (
    <PoliciesTable
      {...tableProps}
      columns={[
        {
          title: translate('Components'),
          render: ({ row }) => (
            <>
              {row.component_limits_set
                .map((x) => `${x.type}: ${x.limit}`)
                .join(', ')}
            </>
          ),
        },
      ]}
      verboseName={translate('Usage policies')}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <PolicyDuplicateAction
            row={row}
            type="usage"
            offering={offering}
            refetch={tableProps.fetch}
          />
          <PolicyDeleteAction
            row={row}
            type="usage"
            refetch={tableProps.fetch}
          />
        </ActionsDropdown>
      )}
      tableActions={
        <UsagePolicyCreateButton
          offering={offering}
          refetch={tableProps.fetch}
        />
      }
    />
  );
};
