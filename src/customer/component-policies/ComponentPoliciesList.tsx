import { lowerCase, upperFirst } from 'lodash-es';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  CustomerComponentUsagePolicy,
  marketplaceCustomerComponentUsagePoliciesList,
  MarketplaceProjectEstimatedCostPoliciesListData,
} from 'waldur-js-client';

import { BooleanBadge } from '@waldur/core/BooleanBadge';
import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { ComponentPolicyCreateButton } from './ComponentPolicyCreateButton';
import { ComponentPolicyDeleteButton } from './ComponentPolicyDeleteButton';
import { ComponentPolicyEditButton } from './ComponentPolicyEditButton';

const ComponentPolicyActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[ComponentPolicyEditButton, ComponentPolicyDeleteButton]}
  />
);

export const ComponentPoliciesList: FC = () => {
  const customer = useSelector(getCustomer);
  const filter = useMemo(() => {
    const result: MarketplaceProjectEstimatedCostPoliciesListData['query'] = {};
    if (customer) {
      result.customer_uuid = customer.uuid;
    }
    return result;
  }, [customer]);

  const tableProps = useTable({
    table: 'ComponentPoliciesList',
    filter,
    fetchData: createFetcher(marketplaceCustomerComponentUsagePoliciesList),
  });

  return (
    <Table<CustomerComponentUsagePolicy>
      {...tableProps}
      columns={[
        {
          title: translate('Component limits'),
          render: ({ row }) => (
            <>
              {row.component_limits_set
                .map((x) => `${x.type}: ${x.limit} (${x.period_name})`)
                .join(', ')}
            </>
          ),
        },
        {
          title: translate('Action'),
          render: ({ row }) => upperFirst(lowerCase(row.actions)),
        },
        {
          title: translate('Has fired'),
          render: ({ row }) => <BooleanBadge value={row.has_fired} />,
        },
        {
          title: translate('Options'),
          render: ({ row }) =>
            Object.keys(row.options || {}).length
              ? Object.values(row.options || {})
              : 'N/A',
        },
      ]}
      verboseName={translate('Component policies')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      rowActions={({ row }) => (
        <ComponentPolicyActions row={row} refetch={tableProps.fetch} />
      )}
      showPageSizeSelector
      tableActions={<ComponentPolicyCreateButton refetch={tableProps.fetch} />}
    />
  );
};
