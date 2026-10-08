import { FC, useMemo } from 'react';
import {
  ComponentUsage,
  marketplaceComponentUsagesList,
  MarketplaceComponentUsagesListData,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { makeLastTwelveMonthsFilterPeriods } from '@/form/utils';
import { translate } from '@/i18n';
import { getStartAndEndDatesOfMonth } from '@/issues/utils';
import { getMissingUsagePolicyLabel } from '@/marketplace/resources/usage/missingUsagePolicy';
import { ResourceLink } from '@/resource/ResourceLink';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { CustomerScopedReport } from '../CustomerScopedReport';
import { usageTableTabs } from '../utils';

import { FORM_ID, ResourceUsageFilter } from './ResourceUsageFilter';
import { UsageExpandableRow } from './UserUsageExpandableRow';

export const selectResourceUsageFilter = (usageFilter: any) => {
  const filter: MarketplaceComponentUsagesListData['query'] = {};
  if (usageFilter) {
    if (usageFilter.accounting_period) {
      const { start } = getStartAndEndDatesOfMonth(
        usageFilter.accounting_period.value,
      );
      const startDate = new Date(start);
      filter.billing_period_year = startDate.getFullYear();
      filter.billing_period_month = startDate.getMonth() + 1;
    }
    if (usageFilter.customer_uuid) {
      filter.customer_uuid = usageFilter.customer_uuid.uuid;
    }
    if (usageFilter.project_uuid) {
      filter.project_uuid = usageFilter.project_uuid.uuid;
    }
    if (usageFilter.offering) {
      filter.offering_uuid = usageFilter.offering.uuid;
    }
    if (usageFilter.resource) {
      filter.resource_uuid = usageFilter.resource.uuid;
    }
    if (usageFilter.missing_usage_policy?.length) {
      filter.missing_usage_policy = usageFilter.missing_usage_policy.map(
        (option) => option.value,
      );
    }
  }
  return filter;
};

/**
 * Usage filter of a report optionally scoped to one organization. The scope
 * wins over a `customer_uuid` table filter carried in the URL.
 */
export const useScopedUsageFilter = (table: string, customerUuid?: string) => {
  const values = useFilterValues(table);
  return useMemo(() => {
    const filter = selectResourceUsageFilter(values);
    if (customerUuid) {
      filter.customer_uuid = customerUuid;
    }
    return filter;
  }, [values, customerUuid]);
};

/**
 * The organization column and its filter say nothing once the report is
 * scoped to a single organization.
 */
export const withoutOrganizationColumn = <T,>(
  columns: Array<Column<T>>,
  customerUuid?: string,
) =>
  customerUuid
    ? columns.filter((column) => column.filter !== 'customer_uuid')
    : columns;

const ResourceUsageTable: FC<{ customerUuid?: string }> = ({
  customerUuid,
}) => {
  const filter = useScopedUsageFilter('ResourceUsageReports', customerUuid);

  const tableProps = useTable({
    table: 'ResourceUsageReports',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceComponentUsagesList),
    filter,
    initialFilters: {
      accounting_period: makeLastTwelveMonthsFilterPeriods()[0],
    },
  });
  const columns: Array<Column<ComponentUsage>> = [
    {
      title: translate('Resource name'),
      render: ({ row }) => (
        <ResourceLink uuid={row.resource_uuid} label={row.resource_name} />
      ),

      filter: 'resource',
      inlineFilter: (row) => ({
        name: row.resource_name,
        uuid: row.resource_uuid,
      }),
      export: 'resource_name',
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
      filter: 'customer_uuid',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
      export: 'customer_name',
    },
    {
      title: translate('Client project'),
      render: ({ row }) => <>{row.project_name}</>,
      filter: 'project_uuid',
      inlineFilter: (row) => ({
        name: row.project_name,
        uuid: row.project_uuid,
      }),
      export: 'project_name',
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
      title: translate('Plan component name'),
      render: ({ row }) => <>{row.name}</>,
      export: 'name',
    },
    {
      title: translate('Missing usage policy'),
      render: ({ row }) => (
        <>{getMissingUsagePolicyLabel(row.missing_usage_policy)}</>
      ),
      export: 'missing_usage_policy',
    },
    {
      title: translate('Date of reporting'),
      render: ({ row }) => <>{formatDateTime(row.date)}</>,
      export: (row) => formatDateTime(row.date),
      exportKeys: ['date'],
    },
    {
      title: translate('Value'),
      render: ({ row }) => (
        <>{formatUsageValue(row.usage) + ' ' + row.measured_unit}</>
      ),
      export: (row) => row.usage + ' ' + row.measured_unit,
      exportKeys: ['usage', 'measured_unit'],
    },
    {
      visible: false,
      title: translate('Comment'),
      render: null,
      export: 'description',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={withoutOrganizationColumn(columns, customerUuid)}
      tabs={usageTableTabs}
      verboseName={translate('Usages')}
      showPageSizeSelector={true}
      enableExport={true}
      expandableRow={({ row }) => (
        <UsageExpandableRow row={row} type="resource-usage" />
      )}
      filters={<ResourceUsageFilter customerUuid={customerUuid} />}
      formId={FORM_ID}
    />
  );
};

export const ResourceUsageList: FC = () => (
  <CustomerScopedReport reportKey="resource-usage">
    {(customerUuid) => <ResourceUsageTable customerUuid={customerUuid} />}
  </CustomerScopedReport>
);
