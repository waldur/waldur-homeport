import { startCase } from 'lodash';
import { FC } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { CreateCreditButton } from '@waldur/customer/credits/CreateCreditButton';
import { CreditActions } from '@waldur/customer/credits/CreditActions';
import { CreditHistoryLogButton } from '@waldur/customer/credits/CreditHistoryLogButton';
import { CustomerCredit } from '@waldur/customer/credits/types';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

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
    fetchData: createFetcher('customer-credits'),
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
        {
          title: translate('Eligible offerings'),
          render: ({ row }) => (
            <>{row.offerings.map((offering) => offering.name).join(', ')}</>
          ),
          export: (row) =>
            row.offerings.map((offering) => offering.name).join(', '),
        },
        {
          title: translate('Consumption logic'),
          render: ({ row }) => startCase(row.minimal_consumption_logic),
          export: 'minimal_consumption_logic',
        },
        {
          title: translate('Minimal consumption'),
          render: ({ row }) => defaultCurrency(row.minimal_consumption),
          orderField: 'minimal_consumption',
          export: (row) => defaultCurrency(row.minimal_consumption),
        },
        {
          title: translate('End date'),
          render: ({ row }) =>
            row.end_date ? formatDate(row.end_date) : <>&mdash;</>,
          orderField: 'end_date',
          export: 'end_date',
        },
        {
          title: translate('Allocated credit'),
          render: ({ row }) => defaultCurrency(row.value),
          orderField: 'value',
          export: (row) => defaultCurrency(row.value),
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
