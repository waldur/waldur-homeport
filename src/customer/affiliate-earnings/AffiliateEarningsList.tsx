import { CoinsIcon, ReceiptIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  customerAffiliatesList,
  customerCreditsList,
  CustomerAffiliate,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { defaultCurrency } from '@/core/formatCurrency';
import { lazyComponent } from '@/core/lazyComponent';
import { StateIndicator } from '@/core/StateIndicator';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { AffiliateLinkExpandableRow } from './AffiliateLinkExpandableRow';

const CreditTransactionsDialog = lazyComponent(() =>
  import('../credits/CreditTransactionsDialog').then((module) => ({
    default: module.CreditTransactionsDialog,
  })),
);

const AdjustWithdrawableDialog = lazyComponent(() =>
  import('../credits/AdjustWithdrawableDialog').then((module) => ({
    default: module.AdjustWithdrawableDialog,
  })),
);

export const AffiliateEarningsList: FC<{ customerUuid: string }> = ({
  customerUuid,
}) => {
  const filter = useMemo(
    () => ({ affiliate_uuid: customerUuid }),
    [customerUuid],
  );
  const tableProps = useTable({
    table: `affiliate-earnings-${customerUuid}`,
    fetchData: createFetcher(customerAffiliatesList),
    filter,
  });

  const { openDialog } = useModal();
  const user = useUser();

  const { data: credit, refetch: refetchCredit } = useQuery({
    queryKey: ['AffiliateCredit', customerUuid],
    queryFn: () =>
      customerCreditsList({ query: { customer_uuid: customerUuid } }).then(
        (response) => response.data[0],
      ),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const summary = useMemo(
    () => [
      {
        label: translate('Total distributable credit'),
        value: defaultCurrency(credit?.withdrawable_balance ?? 0),
      },
      {
        label: translate('Total credit balance'),
        value: defaultCurrency(credit?.value ?? 0),
      },
    ],
    [credit],
  );

  const columns = useMemo<Array<Column<CustomerAffiliate>>>(
    () => [
      {
        title: translate('Referred organization'),
        orderField: 'customer_name',
        render: ({ row }) => renderFieldOrDash(row.customer_name),
      },
      {
        title: translate('Fee'),
        render: ({ row }) =>
          renderFieldOrDash(
            row.fee_percent != null ? `${row.fee_percent}%` : row.fee_percent,
          ),
      },
      {
        title: translate('Status'),
        orderField: 'is_active',
        render: ({ row }) => (
          <StateIndicator
            label={row.is_active ? translate('Active') : translate('Inactive')}
            variant={row.is_active ? 'success' : 'default'}
            outline
            pill
          />
        ),
      },
      {
        title: translate('Total earned'),
        orderField: 'total_earned',
        render: ({ row }) => defaultCurrency(row.total_earned),
      },
    ],
    [],
  );

  return (
    <>
      {credit && <SummaryWidget stats={summary} />}
      <Table<CustomerAffiliate>
        {...tableProps}
        columns={columns}
        title={translate('Affiliate earnings')}
        verboseName={translate('Affiliate links')}
        hasQuery={false}
        expandableRow={AffiliateLinkExpandableRow}
        tableActions={
          <>
            {user?.is_staff && credit && (
              <ActionButton
                action={() =>
                  openDialog(AdjustWithdrawableDialog, {
                    resolve: { credit, refetch: refetchCredit },
                  })
                }
                title={translate('Adjust withdrawable balance')}
                variant="tertiary"
                iconNode={<CoinsIcon weight="bold" />}
              />
            )}
            <ActionButton
              action={() =>
                openDialog(CreditTransactionsDialog, {
                  resolve: { customerUuid },
                  size: 'lg',
                })
              }
              title={translate('Credit transactions')}
              variant="tertiary"
              iconNode={<ReceiptIcon weight="bold" />}
            />
          </>
        }
      />
    </>
  );
};
