import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { PoliciesTable } from './PoliciesTable';
import { PolicyDeleteButton } from './PolicyDeleteButton';
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
    fetchData: createFetcher('marketplace-offering-usage-policies'),
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
        <PolicyDeleteButton row={row} type="usage" refetch={tableProps.fetch} />
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
