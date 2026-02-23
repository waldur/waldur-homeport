import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  marketplacePlansUsageStatsList,
  MarketplacePlansUsageStatsListData,
  PlanUsageResponse,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { PlanRemainingColumn } from '@waldur/marketplace/common/PlanRemainingColumn';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { PlanUsageAnalytics } from './PlanUsageAnalytics';
import { PlanUsageFilter } from './PlanUsageFilter';
import { PlanUsageRowActions } from './PlanUsageRowActions';

export const PlanUsageList: FunctionComponent = () => {
  useReportBreadcrumbs({ currentReport: 'capacity', category: 'provider' });

  const formFilter = useSelector(mapStateToProps);
  const props = useTable({
    table: 'PlanUsages',
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
    <Table<PlanUsageResponse>
      {...props}
      columns={columns}
      verboseName={translate('plans')}
      showPageSizeSelector={true}
      enableExport={true}
      initialSorting={{ field: 'usage', mode: 'desc' }}
      rowActions={PlanUsageRowActions}
      filters={<PlanUsageFilter />}
      tableActions={
        <PlanUsageAnalytics data={props.rows} loading={props.loading} />
      }
    />
  );
};

const mapStateToProps = createSelector(
  getFormValues('PlanUsageFilter'),
  (filterValues: any) => {
    const filter: MarketplacePlansUsageStatsListData['query'] = {};
    if (filterValues) {
      if (filterValues.provider) {
        filter.customer_provider_uuid = filterValues.provider.customer_uuid;
      }
      if (filterValues.offering) {
        filter.offering_uuid = filterValues.offering.uuid;
      }
    }
    return filter;
  },
);
