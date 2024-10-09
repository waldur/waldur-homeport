import { FC } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { Table } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { renderFieldOrDash } from '@waldur/table/utils';

import { CreateCreditButton } from './CreateCreditButton';
import { CreditActions } from './CreditActions';
import { CustomerCredit } from './types';

interface CreditsAllListTableProps extends TableProps {}

export const CreditsListTable: FC<CreditsAllListTableProps> = (props) => {
  return (
    <Table<CustomerCredit>
      {...props}
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
          title: translate('Allocated credit (in {currency})', {
            currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
          }),
          render: ({ row }) => <>{row.value}</>,
          orderField: 'value',
          export: 'value',
        },
      ]}
      title={translate('Credit management')}
      verboseName={translate('Credits')}
      hasQuery
      enableExport
      rowActions={CreditActions}
      tableActions={<CreateCreditButton refetch={props.fetch} />}
    />
  );
};
