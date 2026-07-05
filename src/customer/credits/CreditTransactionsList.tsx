import { FC, useMemo } from 'react';
import { creditTransactionsList, CreditTransaction } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

// The credit-transaction ledger — the trace of how a credit's value (and its
// withdrawable part) changed over time. Visible to staff and the credit's
// organization owner.
export const CreditTransactionsList: FC<{ customerUuid: string }> = ({
  customerUuid,
}) => {
  const filter = useMemo(
    () => ({ customer_uuid: customerUuid }),
    [customerUuid],
  );
  const tableProps = useTable({
    table: `credit-transactions-${customerUuid}`,
    fetchData: createFetcher(creditTransactionsList),
    filter,
  });

  const columns = useMemo<Array<Column<CreditTransaction>>>(
    () => [
      {
        title: translate('Date'),
        render: ({ row }) => formatDate(row.created),
      },
      {
        title: translate('Type'),
        render: ({ row }) => row.transaction_type_display,
      },
      {
        title: translate('Amount'),
        render: ({ row }) => defaultCurrency(row.amount),
      },
      {
        title: translate('Comment'),
        render: ({ row }) => renderFieldOrDash(row.comment),
      },
    ],
    [],
  );

  return (
    <Table<CreditTransaction>
      {...tableProps}
      columns={columns}
      title={translate('Credit transactions')}
      verboseName={translate('Credit transactions')}
      hasQuery={false}
    />
  );
};
