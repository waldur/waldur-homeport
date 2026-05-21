import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { adminArrowBillingSyncsList, ArrowBillingSync } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getPreviousBillingPeriods } from '@/reporting/usage-monitoring/utils';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import {
  AdminArrowBillingSyncsFilter as BillingSyncFilter,
  selectAdminArrowBillingSyncsFilter as selectBillingSyncFilter,
  AdminArrowBillingSyncsFilterFormId,
} from '@/table/generated/AdminArrowBillingSyncsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import {
  getBillingSyncStateLabel,
  getBillingSyncStateVariant,
} from '../constants';

import { BillingSyncActions } from './BillingSyncActions';
import { BillingSyncButton } from './BillingSyncButton';
import { BillingSyncStatusCard } from './BillingSyncStatusCard';

const mandatoryFields: Array<keyof ArrowBillingSync> = [
  'uuid',
  'arrow_reference',
  'waldur_customer_name',
  'report_period',
  'state',
  'arrow_state',
  'sell_total',
  'buy_total',
  'currency',
  'items',
  'created',
  'validated_at',
];

interface BillingSyncListProps {
  settings?: { uuid: string } | null;
}

const BillingSyncListTable: FunctionComponent<BillingSyncListProps> = ({
  settings,
}) => {
  const { values } = useFormState();
  const formFilter = useMemo(() => selectBillingSyncFilter(values), [values]);

  const billingPeriods = useMemo(
    () =>
      getPreviousBillingPeriods(12).map((period) => ({
        label: period,
        value: period,
      })),
    [],
  );

  const filter = useMemo(
    () => ({
      ...formFilter,
      ...(settings?.uuid ? { settings_uuid: settings.uuid } : {}),
    }),
    [formFilter, settings?.uuid],
  );

  const tableProps = useTable({
    table: 'ArrowBillingSyncs',
    fetchData: createFetcher(adminArrowBillingSyncsList),
    filter,
    queryField: 'arrow_reference',
    mandatoryFields,
  });

  return (
    <div className="d-flex flex-column gap-6">
      <BillingSyncStatusCard />
      <Table<ArrowBillingSync>
        {...tableProps}
        columns={[
          {
            title: translate('Customer'),
            render: ({ row }) => (
              <span>{row.waldur_customer_name || row.arrow_reference}</span>
            ),
          },
          {
            title: translate('Period'),
            render: ({ row }) => <span>{row.report_period}</span>,
          },
          {
            title: translate('State'),
            render: ({ row }) => (
              <Badge
                variant={getBillingSyncStateVariant(row.state)}
                pill
                outline
              >
                {getBillingSyncStateLabel(row.state)}
              </Badge>
            ),
          },
          {
            title: translate('Arrow State'),
            render: ({ row }) => (
              <span className="text-muted">{row.arrow_state}</span>
            ),
          },
          {
            title: translate('Sell Total'),
            render: ({ row }) =>
              row.sell_total ? (
                <>
                  {defaultCurrency(row.sell_total)} {row.currency}
                </>
              ) : (
                DASH_ESCAPE_CODE
              ),
          },
          {
            title: translate('Buy Total'),
            render: ({ row }) =>
              row.buy_total ? (
                <>
                  {defaultCurrency(row.buy_total)} {row.currency}
                </>
              ) : (
                DASH_ESCAPE_CODE
              ),
          },
          {
            title: translate('Items'),
            render: ({ row }) => <>{row.items?.length || 0}</>,
          },
          {
            title: translate('Validated At'),
            render: ({ row }) => (
              <>
                {row.validated_at
                  ? formatDateTime(row.validated_at)
                  : DASH_ESCAPE_CODE}
              </>
            ),
          },
        ]}
        title={translate('Billing syncs')}
        verboseName={translate('billing syncs')}
        initialSorting={{ field: 'created', mode: 'desc' }}
        hasQuery
        filters={<BillingSyncFilter billingPeriods={billingPeriods} />}
        rowActions={({ row }) => <BillingSyncActions row={row} />}
        tableActions={<BillingSyncButton refetch={tableProps.fetch} />}
        formId={AdminArrowBillingSyncsFilterFormId}
      />
    </div>
  );
};

export const BillingSyncList = (props) => (
  <Form
    id={AdminArrowBillingSyncsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <BillingSyncListTable {...props} />}
  </Form>
);
