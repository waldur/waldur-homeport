import { FunctionComponent, useMemo } from 'react';
import {
  adminArrowConsumptionRecordsList,
  ArrowConsumptionRecord,
} from 'waldur-js-client';

import { HelpIcon } from 'waldur-ui';
import { Badge, PropertyItem } from 'waldur-ui';

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

import { ForceImportConsumptionButton } from './ForceImportConsumptionButton';

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
          title: translate('Period'),
          render: ({ row }) => <span>{row.billing_period}</span>,
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
          title: translate('Consumed'),
          render: ({ row }) => <>{defaultCurrency(row.consumed_sell)}</>,
        },
        {
          title: (
            <>
              {translate('Final')}{' '}
              <HelpIcon
                label={translate(
                  'Confirmed amount from Arrow billing export. Empty until reconciliation is run.',
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
                  'Pending: provisional amount from Arrow API. Finalized: confirmed by billing export. Reconciled: adjustment applied if final differs from consumed.',
                )}
                size={18}
              />
            </>
          ),
          render: ({ row }) => (
            <div className="flex flex-col gap-1">
              <Badge
                variant={row.is_finalized ? 'success' : 'warning'}
                shape="pill"
                tone="outline"
              >
                {row.is_finalized
                  ? translate('Finalized')
                  : translate('Pending')}
              </Badge>
              {row.is_reconciled && (
                <Badge variant="primary" shape="pill" tone="outline">
                  {translate('Reconciled')}
                </Badge>
              )}
            </div>
          ),
        },
      ]}
      title={translate('Consumption records')}
      verboseName={translate('consumption records')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery
      tableActions={<ForceImportConsumptionButton refetch={tableProps.fetch} />}
      filters={<ConsumptionRecordsFilter />}
      expandableRow={ConsumptionRecordDetail}
      formId={AdminArrowConsumptionRecordsFilterFormId}
    />
  );
};

const ConsumptionRecordDetail = ({ row }: { row: ArrowConsumptionRecord }) => (
  <ExpandableContainer asTable>
    <PropertyItem label={translate('UUID')} value={row.uuid} />
    <PropertyItem
      label={translate('License Reference')}
      value={row.license_reference}
    />
    <PropertyItem label={translate('Resource')} value={row.resource_name} />
    <PropertyItem
      label={translate('Created')}
      value={propVal.date(row.created, { precision: 'datetime' })}
    />
    <PropertyItem
      label={translate('Billing Period')}
      value={row.billing_period}
    />
    <PropertyItem
      label={translate('Consumed (Sell)')}
      value={propVal.currency(row.consumed_sell)}
    />
    <PropertyItem
      label={translate('Final (Sell)')}
      // No final amount means the billing export has not confirmed it yet,
      // which is worth showing, so the row keeps a dash instead of going.
      value={propVal.currency(row.final_sell)}
      placeholder="dash"
      valueClass="font-medium"
    />
  </ExpandableContainer>
);
