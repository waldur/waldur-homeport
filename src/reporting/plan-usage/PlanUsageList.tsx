import { FunctionComponent, useMemo } from 'react';
import {
  marketplacePlansUsageStatsList,
  PlanUsageResponse,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { PlanRemainingColumn } from '@/marketplace/common/PlanRemainingColumn';
import { createFetcher } from '@/table/api';
import {
  MarketplacePlansUsageStatsFilter,
  selectMarketplacePlansUsageStatsFilter,
  MarketplacePlansUsageStatsFilterFormId,
} from '@/table/generated/MarketplacePlansUsageStatsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ReportingTitle } from '../ReportingTitle';

import { PlanUsageAnalytics } from './PlanUsageAnalytics';
import { PlanUsageRowActions } from './PlanUsageRowActions';

export const PlanUsageList: FunctionComponent = () => {
  const values = useFilterValues('PlanUsages');

  const formFilter = useMemo(
    () => selectMarketplacePlansUsageStatsFilter(values),
    [values],
  );

  const props = useTable({
    table: 'PlanUsages',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplacePlansUsageStatsList),
    filter: formFilter,
  });
  const columns: Column<PlanUsageResponse>[] = [
    {
      title: translate('Service provider'),
      render: ({ row }) => <>{row.customer_provider_name}</>,
      filter: 'provider',
      inlineFilter: (row) => ({
        customer_name: row.customer_provider_name,
        customer_uuid: row.customer_provider_uuid,
      }),
      export: 'customer_provider_name',
    },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
      filter: 'offering',
      inlineFilter: (row) => ({
        name: row.offering_name,
        uuid: row.offering_uuid,
      }),
      export: 'offering_name',
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <>{row.plan_name}</>,
      export: 'plan_name',
    },
    {
      title: translate('Active count'),
      render: ({ row }) => <>{row.usage}</>,
      orderField: 'usage',
      exportTitle: translate('Active plan count'),
      export: 'usage',
    },
    {
      title: translate('Limit'),
      render: ({ row }) => <>{renderFieldOrDash(row.limit)}</>,
      orderField: 'limit',
      export: 'limit',
    },
    {
      title: translate('Remaining'),
      render: PlanRemainingColumn,
      orderField: 'remaining',
      export: false,
    },
  ];

  return (
    <>
      <ReportingTitle reportKey="capacity" />
      <Table<PlanUsageResponse>
        {...props}
        columns={columns}
        verboseName={translate('plans')}
        showPageSizeSelector={true}
        enableExport={true}
        initialSorting={{ field: 'usage', mode: 'desc' }}
        rowActions={PlanUsageRowActions}
        filters={<MarketplacePlansUsageStatsFilter />}
        tableActions={
          <PlanUsageAnalytics data={props.rows} loading={props.loading} />
        }
        formId={MarketplacePlansUsageStatsFilterFormId}
      />
    </>
  );
};
