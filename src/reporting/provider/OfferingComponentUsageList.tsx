import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { marketplaceComponentUsageMonthlyList } from 'waldur-js-client';

import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { OfferingComponentUsage } from '@/marketplace/offerings/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { ReportingTitle } from '../ReportingTitle';

import { OfferingComponentUsageExpandableRow } from './OfferingComponentUsageExpandableRow';
import {
  COMPONENT_USAGE_FILTER_FORM_ID,
  OfferingComponentUsageFilter,
} from './OfferingComponentUsageFilter';

export const OfferingComponentUsageList = () => {
  const { params } = useCurrentStateAndParams();
  const values = useFilterValues('OfferingComponentUsage');
  const filterValues = values;

  const activeTab = params.tab || 'usage';

  const filter = useMemo(
    () => ({
      customer_uuid: filterValues?.provider?.customer_uuid,
      offering_uuid: filterValues?.offering?.uuid,
      offering_type: filterValues?.offering_type?.value,
      billing_type: activeTab,
      component_type: filterValues?.component_type,
      field: [
        'service_provider_name',
        'offering_uuid',
        'offering_name',
        'category_title',
        'offering_type',
        'component_name',
        'component_type',
        'billing_type',
        'usage_percent',
        'total_consumed',
        'total_allocated',
        'measured_unit',
        'limit_period',
      ],
    }),
    [filterValues, activeTab],
  );

  const props = useTable({
    table: 'OfferingComponentUsage',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceComponentUsageMonthlyList),
    filter,
  });

  const columns: Column<OfferingComponentUsage>[] = [
    {
      title: translate('Offering'),
      render: ({ row }) => <span className="fw-bold">{row.offering_name}</span>,
      filter: 'offering',
      orderField: 'offering_name',
    },
    {
      title: translate('Component'),
      render: ({ row }) => (
        <span className="fw-bold">{row.component_name}</span>
      ),
      orderField: 'component_name',
    },

    {
      title: translate('Usage'),
      render: ({ row }) => {
        const usage =
          row.usage_percent !== undefined ? Number(row.usage_percent) : 0;
        return (
          <div className="d-flex flex-column gap-1" style={{ minWidth: 150 }}>
            <div className="d-flex justify-content-between fs-7 text-muted">
              <span>
                {formatUsageValue(row.total_consumed, true)} /{' '}
                {formatUsageValue(row.total_allocated, true)}{' '}
                {row.measured_unit}
              </span>
              <span className="fw-bold text-dark">{usage.toFixed(1)}%</span>
            </div>
            <div className="progress h-6px w-100">
              <div
                className={`progress-bar bg-${
                  usage < 50 ? 'primary' : usage < 80 ? 'warning' : 'danger'
                }`}
                role="progressbar"
                style={{ width: `${Math.min(usage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
      orderField: 'usage_percent',
    },
  ];

  return (
    <>
      <ReportingTitle reportKey="offering-usage" />
      <Table<OfferingComponentUsage>
        {...props}
        columns={columns}
        filters={<OfferingComponentUsageFilter />}
        tabs={[
          {
            key: 'usage',
            title: translate('Usage-based'),
            params: { tab: 'usage' },
          },
          {
            key: 'limit',
            title: translate('Limit-based'),
            params: { tab: 'limit' },
          },
        ]}
        verboseName={translate('offering component usages')}
        enableExport={true}
        hideTitle
        initialSorting={{ field: 'usage_percent', mode: 'desc' }}
        expandableRow={OfferingComponentUsageExpandableRow}
        formId={COMPONENT_USAGE_FILTER_FORM_ID}
      />
    </>
  );
};
