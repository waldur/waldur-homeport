import { FunctionComponent, useMemo } from 'react';
import {
  adminArrowConsumptionRecordsList,
  ArrowConsumptionRecord,
} from 'waldur-js-client';

import { AlertItem, Badge, HelpIcon, PropertyItem } from 'waldur-ui';

import { formatMonth } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import {
  AdminArrowConsumptionRecordsFilter as ConsumptionRecordsFilter,
  selectAdminArrowConsumptionRecordsFilter as selectConsumptionRecordsFilter,
  AdminArrowConsumptionRecordsFilterFormId,
} from '@/table/generated/AdminArrowConsumptionRecordsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { useArrowConsumptionStatus, useArrowSettings } from '../api';

import { ForceImportConsumptionButton } from './ForceImportConsumptionButton';

const monthHasEnded = (billingPeriod: string) => {
  const start = new Date(`${billingPeriod}T00:00:00`);
  const nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return nextMonth <= new Date();
};

const RecordStatus = ({ row }: { row: ArrowConsumptionRecord }) => {
  if (row.is_finalized) {
    return (
      <Badge variant="success" shape="pill" tone="outline">
        {translate('Settled')}
      </Badge>
    );
  }
  return monthHasEnded(row.billing_period) ? (
    <Badge variant="warning" shape="pill" tone="outline">
      {translate('Awaiting final billing')}
    </Badge>
  ) : (
    <Badge variant="neutral" shape="pill" tone="outline">
      {translate('Estimate')}
    </Badge>
  );
};

const HowConsumptionIsBilled = () => {
  const { data: status } = useArrowConsumptionStatus();
  const { data: settings } = useArrowSettings();
  const prefix =
    settings?.invoice_item_prefix || translate('Arrow consumption');
  const automatic = Boolean(
    status?.global_sync_enabled && settings?.sync_enabled,
  );
  return (
    <>
      <AlertItem
        type="floating"
        variant="info"
        className="mb-3"
        title={translate('How Arrow consumption is billed')}
        body={
          <ol className="mb-0 mt-1 ps-5 list-decimal">
            <li>
              {translate(
                'While a month runs, each license gets one "{prefix}" item on that month\'s invoice, updated on every consumption sync (Estimate).',
                { prefix },
              )}
            </li>
            <li>
              {translate(
                "After the month ends, Arrow's final billing is compared with what was invoiced (Awaiting final billing).",
              )}
            </li>
            <li>
              {translate(
                'Any difference is added to the current invoice as an adjustment, and the record is Settled. Issued invoices are never changed.',
              )}
            </li>
          </ol>
        }
      />
      {status && settings && !automatic && (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-3"
          title={translate('Automatic consumption sync is off')}
          body={
            status.global_sync_enabled
              ? translate(
                  'Sync is paused in the Arrow settings, so records only change when you run Debug → Sync consumption. Resume sync on the Overview tab to update them automatically.',
                )
              : translate(
                  'Records only change when you run Debug → Sync consumption. Turn on "Arrow consumption sync enabled" under Sync settings to update them automatically.',
                )
          }
        />
      )}
    </>
  );
};

const mandatoryFields: Array<keyof ArrowConsumptionRecord> = [
  'uuid',
  'license_reference',
  'resource_name',
  'billing_period',
  'customer_name',
  'project_name',
  'consumed_sell',
  'final_sell',
  'is_finalized',
  'is_reconciled',
  'consumed_buy',
  'adjustment_amount',
  'created',
];

interface ConsumptionRecordsListProps {
  settings?: { uuid: string } | null;
}

export const ConsumptionRecordsList: FunctionComponent<
  ConsumptionRecordsListProps
> = () => {
  const values = useFilterValues('ArrowConsumptionRecords');

  const filter = useMemo(
    () => selectConsumptionRecordsFilter(values),
    [values],
  );

  const tableProps = useTable({
    table: 'ArrowConsumptionRecords',
    syncFiltersToURL: true,
    fetchData: createFetcher(adminArrowConsumptionRecordsList),
    filter,
    queryField: 'license_reference',
    mandatoryFields,
  });

  return (
    <>
      <HowConsumptionIsBilled />
      <Table<ArrowConsumptionRecord>
        {...tableProps}
        columns={[
          {
            title: translate('License'),
            render: ({ row }) => <div>{row.license_reference}</div>,
          },
          {
            title: translate('Resource'),
            render: ({ row }) => (
              <span className="text-primary">
                {row.resource_name || DASH_ESCAPE_CODE}
              </span>
            ),
          },
          {
            title: translate('Month'),
            render: ({ row }) => <span>{formatMonth(row.billing_period)}</span>,
          },
          {
            title: translate('Customer'),
            render: ({ row }) => (
              <span>{row.customer_name || DASH_ESCAPE_CODE}</span>
            ),
            filter: 'customer_uuid',
          },
          {
            title: translate('Project'),
            render: ({ row }) => (
              <span>{row.project_name || DASH_ESCAPE_CODE}</span>
            ),
          },
          {
            title: (
              <>
                {translate('Consumed')}{' '}
                <HelpIcon
                  label={translate(
                    "Usage reported by Arrow so far, at sell price. This is what the month's invoice item charges while the month runs.",
                  )}
                  size={18}
                />
              </>
            ),
            render: ({ row }) => <>{defaultCurrency(row.consumed_sell)}</>,
          },
          {
            title: (
              <>
                {translate('Final')}{' '}
                <HelpIcon
                  label={translate(
                    "The amount on Arrow's final billing for the month. Empty until the month has ended and been reconciled.",
                  )}
                  size={18}
                />
              </>
            ),
            render: ({ row }) =>
              row.final_sell ? (
                <>{defaultCurrency(row.final_sell)}</>
              ) : (
                DASH_ESCAPE_CODE
              ),
          },
          {
            title: (
              <>
                {translate('Status')}{' '}
                <HelpIcon
                  label={translate(
                    "Estimate: the month is still running. Awaiting final billing: the month has ended, Arrow's final billing has not been applied yet. Settled: the final amount has been charged, with any difference added to the current invoice.",
                  )}
                  size={18}
                />
              </>
            ),
            render: ({ row }) => <RecordStatus row={row} />,
          },
        ]}
        title={translate('Consumption records')}
        verboseName={translate('consumption records')}
        initialSorting={{ field: 'created', mode: 'desc' }}
        hasQuery
        tableActions={
          <ForceImportConsumptionButton refetch={tableProps.fetch} />
        }
        filters={<ConsumptionRecordsFilter />}
        expandableRow={ConsumptionRecordDetail}
        formId={AdminArrowConsumptionRecordsFilterFormId}
      />
    </>
  );
};

const ConsumptionRecordDetail = ({ row }: { row: ArrowConsumptionRecord }) => (
  <ExpandableContainer asTable>
    <PropertyItem
      label={translate('License Reference')}
      value={row.license_reference}
    />
    <PropertyItem label={translate('Resource')} value={row.resource_name} />
    <PropertyItem
      label={translate('Month')}
      value={propVal.date(row.billing_period, { precision: 'month' })}
    />
    <PropertyItem
      label={translate('Consumed (sell)')}
      value={propVal.currency(row.consumed_sell)}
    />
    <PropertyItem
      label={translate('Consumed (buy)')}
      value={propVal.currency(row.consumed_buy)}
    />
    <PropertyItem
      label={translate('Final (sell)')}
      // No final amount means the month is not settled yet, which is worth
      // showing, so the row keeps a dash instead of going.
      value={propVal.currency(row.final_sell)}
      placeholder="dash"
      valueClass="font-medium"
    />
    <PropertyItem
      label={translate('Adjustment')}
      value={propVal.currency(row.adjustment_amount)}
      placeholder="dash"
    />
    <PropertyItem
      label={translate('Recorded')}
      value={propVal.date(row.created, { precision: 'datetime' })}
    />
  </ExpandableContainer>
);
