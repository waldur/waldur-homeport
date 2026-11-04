import { FC } from 'react';
import { CustomerCredit, customerCreditsList } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { getCreditColumns } from '@/customer/credits/constants';
import { CreateCreditButton } from '@/customer/credits/CreateCreditButton';
import { CreditExpandableRow } from '@/customer/credits/CreditExpandableRow';
import { CustomerCreditActions } from '@/customer/credits/CustomerCreditActions';
import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { tabTableProps } from '../tabTableProps';

const OrganizationField = ({ row }) => (
  <Link
    state="organization.dashboard"
    params={{ uuid: row.customer_uuid }}
    label={row.customer_name}
  />
);

export const OrganizationCreditsList: FC<Partial<TableWithPortal>> = ({
  portal,
}) => {
  const tableProps = useTable({
    table: 'OrganizationCreditsList',
    fetchData: createFetcher(customerCreditsList),
    queryField: 'query',
  });

  return (
    <Table<CustomerCredit>
      {...tableProps}
      {...tabTableProps(portal)}
      columns={[
        {
          title: translate('Organization name'),
          render: OrganizationField,
          export: 'customer_name',
        },
        ...getCreditColumns(translate('Total credit')),
        // The split by kind is in the expanded row on screen; the export
        // carries it as columns of its own.
        ...(
          [
            ['paid_balance', translate('Paid credit')],
            ['granted_balance', translate('Granted credit')],
            ['withdrawable_balance', translate('Withdrawable balance')],
          ] as const
        ).map(([field, title]) => ({
          visible: false,
          title,
          render: null,
          export: (row: CustomerCredit) => defaultCurrency(row[field]),
        })),
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
