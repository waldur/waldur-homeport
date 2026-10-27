import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import {
  CompensateInEnum,
  EarlierInvoicePayment,
  projectCreditsPayEarlierInvoices,
} from 'waldur-js-client';

import { AlertItem, RadioGroup } from 'waldur-ui';

import { formatMonth } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getCompensateInOptions } from '@/project/manage/EarlierInvoicesField';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const PaymentsTable: FC<{
  creditUuid: string;
  payments: EarlierInvoicePayment[];
}> = ({ creditUuid, payments }) => {
  const tableProps = useTable({
    table: `pay-earlier-invoices-preview-${creditUuid}`,
    fetchData: createClientPaginatedFetcher(payments),
  });
  useEffect(() => {
    tableProps.fetch();
  }, [payments]);
  return (
    <Table<EarlierInvoicePayment>
      {...tableProps}
      columns={[
        {
          title: translate('Pays'),
          render: ({ row }) => <>{formatMonth(row.period)}</>,
        },
        {
          title: translate('Written on'),
          render: ({ row }) => (
            <>
              {translate('{month} invoice', {
                month: formatMonth(row.invoice_period),
              })}
            </>
          ),
        },
        {
          title: translate('Resource'),
          render: ({ row }) => <>{renderFieldOrDash(row.resource_name)}</>,
        },
        {
          title: translate('Cost item'),
          render: ({ row }) => (
            <span className="whitespace-normal">{row.item_name}</span>
          ),
        },
        {
          title: translate('Compensation'),
          render: ({ row }) => <>{defaultCurrency(-Number(row.amount))}</>,
        },
      ]}
      verboseName={translate('compensations')}
      hideTitle
      hasActionBar={false}
      initialPageSize={5}
      minHeight="auto"
      cardBordered={false}
      bodyClassName="p-0"
      placeholderHasRetry={false}
    />
  );
};

/** What saving these settings would pay now, from the server's dry run:
 * the compensations, where each goes, and the credit before and after. */
export const PaymentPreview: FC<{
  creditUuid: string;
  compensateIn: CompensateInEnum;
  /** Bounds not saved yet; the credit's own when left out. */
  period?: { from?: string | null; until?: string | null };
}> = ({ creditUuid, compensateIn, period }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'PayEarlierInvoicesPreview',
      creditUuid,
      compensateIn,
      period?.from,
      period?.until,
    ],
    queryFn: () =>
      projectCreditsPayEarlierInvoices({
        path: { uuid: creditUuid },
        body: {
          dry_run: true,
          compensate_in: compensateIn,
          ...(period
            ? {
                earlier_invoices_from: period.from || null,
                earlier_invoices_until: period.until || null,
              }
            : {}),
        },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex flex-col gap-4">
      {compensateIn === 'incurred_month' ? (
        <AlertItem
          variant="warning"
          title={translate(
            'The invoices of the months paid change: their totals go down by the compensation, including invoices already sent or paid.',
          )}
        />
      ) : null}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError || !data ? (
        <AlertItem
          variant="error"
          title={translate('The payment could not be previewed.')}
        />
      ) : data.payments.length === 0 ? (
        <AlertItem
          variant="info"
          title={translate(
            'Nothing is paid now: there is no uncovered cost in these months, or this month’s cost uses all of the credit left. What can be paid later is paid at the end of the month.',
          )}
        />
      ) : (
        <>
          <PaymentsTable creditUuid={creditUuid} payments={data.payments} />
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 mb-0">
            <dt className="text-secondary">{translate('Paid now')}</dt>
            <dd className="mb-0 font-semibold">
              {defaultCurrency(data.total)}
            </dd>
            <dt className="text-secondary">{translate('Project credit')}</dt>
            <dd className="mb-0">
              {defaultCurrency(data.project_credit_before)} →{' '}
              {defaultCurrency(data.project_credit_after)}
            </dd>
            <dt className="text-secondary">
              {translate('Organization credit')}
            </dt>
            <dd className="mb-0">
              {defaultCurrency(data.customer_credit_before)} →{' '}
              {defaultCurrency(data.customer_credit_after)}
            </dd>
          </dl>
        </>
      )}
    </div>
  );
};

/** The confirmation's body for paying earlier invoices from a cost policy's
 * fix: the choice of invoice, and what it pays. The choice comes back as the
 * confirmation's result. */
export const PayEarlierInvoicesPreview: FC<{
  creditUuid: string;
  initial: CompensateInEnum;
  value: CompensateInEnum | null;
  onChange(value: CompensateInEnum): void;
}> = ({ creditUuid, initial, value, onChange }) => {
  const compensateIn = value ?? initial;
  return (
    <div className="mt-4 flex flex-col gap-4 text-start">
      <RadioGroup
        label={translate('Write the compensation on')}
        options={getCompensateInOptions() as any}
        value={compensateIn}
        onValueChange={(next) => onChange(next as CompensateInEnum)}
      />
      <PaymentPreview creditUuid={creditUuid} compensateIn={compensateIn} />
      <p className="mb-0 text-quaternary text-sm">
        {translate(
          'This also turns on “Pay earlier invoices” for the project credit, so what is still not covered is paid at the end of each month. Payments are not undone when it is turned off.',
        )}
      </p>
    </div>
  );
};
