import { FC } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { CreateCreditButton } from '@waldur/customer/credits/CreateCreditButton';
import { CreditActions } from '@waldur/customer/credits/CreditActions';
import { CreditHistoryLogButton } from '@waldur/customer/credits/CreditHistoryLogButton';
import { CustomerCredit } from '@waldur/customer/credits/types';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

export const OrganizationCreditsList: FC<{}> = () => {
  const tableProps = useTable({
    table: 'OrganizationCreditsList',
    fetchData: createFetcher('customer-credits'),
    queryField: 'query',
  });

  return (
    <Table<CustomerCredit>
      {...tableProps}
      columns={[
        {
          title: translate('Organization name'),
          render: ({ row }) => renderFieldOrDash(row.customer_name),
          export: 'customer_name',
        },
        {
          title: translate('Offerings'),
          render: ({ row }) => (
            <>{row.offerings.map((offering) => offering.name).join(', ')}</>
          ),
          export: (row) =>
            row.offerings.map((offering) => offering.name).join(', '),
        },
        {
          title: translate('Allocated credit'),
          render: ({ row }) => defaultCurrency(row.value),
          orderField: 'value',
          export: 'value',
        },
      ]}
      title={translate('Credit management')}
      verboseName={translate('Credits')}
      hasQuery
      enableExport
      rowActions={CreditActions}
      tableActions={
        <>
          <CreditHistoryLogButton />
          <CreateCreditButton refetch={tableProps.fetch} />
        </>
      }
    />
  );
};
