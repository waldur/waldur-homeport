import { FC } from 'react';
import { CustomerCredit, customerCreditsList } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { COMMON_CREDIT_COLUMNS } from '@/customer/credits/constants';
import { CreateCreditButton } from '@/customer/credits/CreateCreditButton';
import { CreditExpandableRow } from '@/customer/credits/CreditExpandableRow';
import { CustomerCreditActions } from '@/customer/credits/CustomerCreditActions';
import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

const OrganizationField = ({ row }) => (
  <Link
    state="organization.dashboard"
    params={{ uuid: row.customer_uuid }}
    label={row.customer_name}
  />
);

export const OrganizationCreditsList: FC<{}> = () => {
  const tableProps = useTable({
    table: 'OrganizationCreditsList',
    fetchData: createFetcher(customerCreditsList),
    queryField: 'query',
  });

  return (
    <Table<CustomerCredit>
      {...tableProps}
      columns={[
        {
          title: translate('Organization name'),
          render: OrganizationField,
          export: 'customer_name',
        },
        ...COMMON_CREDIT_COLUMNS,
      ]}
      title={translate('Credit management')}
      verboseName={translate('Credits')}
      hasQuery
      enableExport
      rowActions={CustomerCreditActions}
      expandableRow={CreditExpandableRow}
      tableActions={
        <>
          <FilteredEventsButton filter={{ feature: 'credits' }} />
          <CreateCreditButton refetch={tableProps.fetch} />
        </>
      }
    />
  );
};
