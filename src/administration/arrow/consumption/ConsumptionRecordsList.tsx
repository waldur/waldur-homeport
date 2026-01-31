import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  adminArrowConsumptionRecordsList,
  ArrowConsumptionRecord,
  AdminArrowConsumptionRecordsListData,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ARROW_FORM_NAMES } from '../constants';

import { ConsumptionRecordsFilter } from './ConsumptionRecordsFilter';

const filtersSelector = createSelector(
  getFormValues(ARROW_FORM_NAMES.consumptionRecordsFilter),
  (filterValues: any) => {
    const result: AdminArrowConsumptionRecordsListData['query'] = {};
    if (filterValues?.organization) {
      result.customer_uuid = filterValues.organization.uuid;
    }
    if (filterValues?.project) {
      result.project_uuid = filterValues.project.uuid;
    }
    if (
      filterValues?.is_finalized !== undefined &&
      filterValues.is_finalized !== null
    ) {
      result.is_finalized = filterValues.is_finalized.value;
    }
    return result;
  },
);

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
  const formFilter = useSelector(filtersSelector);

  const filter = useMemo(
    () => ({
      ...formFilter,
    }),
    [formFilter],
  );

  const tableProps = useTable({
    table: 'ArrowConsumptionRecords',
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
          render: ({ row }) => (
            <div>
              <code className="text-dark">{row.license_reference}</code>
            </div>
          ),
        },
        {
          title: translate('Resource'),
          render: ({ row }) => (
            <span className="text-dark">
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
          filter: 'organization',
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
          title: translate('Final'),
          render: ({ row }) =>
            row.final_sell ? (
              <>{defaultCurrency(row.final_sell)}</>
            ) : (
              DASH_ESCAPE_CODE
            ),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <div className="d-flex flex-column gap-1">
              <Badge
                variant={row.is_finalized ? 'success' : 'warning'}
                pill
                outline
              >
                {row.is_finalized
                  ? translate('Finalized')
                  : translate('Pending')}
              </Badge>
              {row.is_reconciled && (
                <Badge variant="primary" pill outline>
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
      filters={<ConsumptionRecordsFilter />}
      expandableRow={ConsumptionRecordDetail}
    />
  );
};

// Expandable row component
const ConsumptionRecordDetail = ({ row }: { row: ArrowConsumptionRecord }) => (
  <div className="p-4 bg-light">
    <div className="row">
      <div className="col-md-6">
        <table className="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td className="text-muted" style={{ width: '40%' }}>
                {translate('UUID')}
              </td>
              <td>
                <code>{row.uuid}</code>
              </td>
            </tr>
            <tr>
              <td className="text-muted">{translate('License Reference')}</td>
              <td>
                <code>{row.license_reference}</code>
              </td>
            </tr>
            <tr>
              <td className="text-muted">{translate('Resource')}</td>
              <td>{row.resource_name || DASH_ESCAPE_CODE}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="col-md-6">
        <table className="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td className="text-muted" style={{ width: '40%' }}>
                {translate('Created')}
              </td>
              <td>{formatDateTime(row.created)}</td>
            </tr>
            <tr>
              <td className="text-muted">{translate('Billing Period')}</td>
              <td>{row.billing_period}</td>
            </tr>
            <tr>
              <td className="text-muted">{translate('Consumed (Sell)')}</td>
              <td>{defaultCurrency(row.consumed_sell)}</td>
            </tr>
            <tr>
              <td className="text-muted">{translate('Final (Sell)')}</td>
              <td className="fw-bold">
                {row.final_sell
                  ? defaultCurrency(row.final_sell)
                  : DASH_ESCAPE_CODE}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
