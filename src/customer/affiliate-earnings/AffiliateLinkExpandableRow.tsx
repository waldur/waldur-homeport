import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo } from 'react';
import {
  customerAffiliatesAccrualsList,
  customerAffiliatesEarningsRetrieve,
  type AffiliateFeeAccrual,
  type CustomerAffiliate,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const formatPeriod = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, '0')}`;

export const AffiliateLinkExpandableRow: FC<{ row: CustomerAffiliate }> = ({
  row,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['AffiliateAccruals', row.uuid],
    queryFn: () =>
      customerAffiliatesAccrualsList({ path: { uuid: row.uuid } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  // The fee the current month is expected to earn; it becomes an accrual only
  // when the referred organization's invoice is closed.
  const { data: upcoming } = useQuery({
    queryKey: ['AffiliateUpcomingFee', row.uuid],
    queryFn: () =>
      customerAffiliatesEarningsRetrieve({ path: { uuid: row.uuid } }).then(
        (response) => response.data.upcoming,
      ),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const tableProps = useTable({
    table: `affiliate-accruals-${row.uuid}`,
    fetchData: createClientPaginatedFetcher(data || []),
  });
  useEffect(() => {
    tableProps.fetch();
  }, [data]);

  const columns = useMemo<Array<Column<AffiliateFeeAccrual>>>(
    () => [
      {
        title: translate('Period'),
        render: ({ row }) => formatPeriod(row.invoice_year, row.invoice_month),
      },
      {
        title: translate('Amount'),
        render: ({ row }) => renderFieldOrDash(defaultCurrency(row.amount)),
      },
      {
        title: translate('Accrued on'),
        render: ({ row }) => renderFieldOrDash(formatDate(row.created)),
      },
    ],
    [],
  );

  return (
    <ExpandableContainer className="border border-secondary rounded-lg">
      {upcoming && (
        <p className="mb-3 text-sm text-secondary">
          {translate('Expected for {period}: {amount}', {
            period: formatPeriod(upcoming.year, upcoming.month),
            amount: defaultCurrency(upcoming.amount),
          })}{' '}
          <span className="text-quaternary">
            {translate(
              'Estimated from the open invoice; accrued when the month is closed.',
            )}
          </span>
        </p>
      )}
      <Table<AffiliateFeeAccrual>
        {...tableProps}
        loading={isLoading}
        columns={columns}
        verboseName={translate('accruals')}
        hasQuery={false}
        hasActionBar={false}
        hoverShadow={false}
        cardBordered={false}
        initialPageSize={5}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
