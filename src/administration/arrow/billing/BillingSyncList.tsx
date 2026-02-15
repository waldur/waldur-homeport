import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  adminArrowBillingSyncsList,
  ArrowBillingSync,
  AdminArrowBillingSyncsListData,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import {
  ARROW_FORM_NAMES,
  getBillingSyncStateLabel,
  getBillingSyncStateVariant,
} from '../constants';

import { BillingSyncActions } from './BillingSyncActions';
import { BillingSyncButton } from './BillingSyncButton';
import { BillingSyncFilter } from './BillingSyncFilter';
import { BillingSyncStatusCard } from './BillingSyncStatusCard';

const filtersSelector = createSelector(
  getFormValues(ARROW_FORM_NAMES.billingSyncFilter),
  (filterValues: any) => {
    const result: AdminArrowBillingSyncsListData['query'] = {};
    if (filterValues?.state) {
      result.state = filterValues.state.value;
    }
    if (filterValues?.report_period_from) {
      result.report_period_from = filterValues.report_period_from;
    }
    if (filterValues?.report_period_to) {
      result.report_period_to = filterValues.report_period_to;
    }
    return result;
  },
);

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

export const BillingSyncList: FunctionComponent<BillingSyncListProps> = ({
  settings,
}) => {
  const formFilter = useSelector(filtersSelector);

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
        filters={<BillingSyncFilter />}
        rowActions={({ row }) => <BillingSyncActions row={row} />}
        tableActions={<BillingSyncButton refetch={tableProps.fetch} />}
      />
    </div>
  );
};
