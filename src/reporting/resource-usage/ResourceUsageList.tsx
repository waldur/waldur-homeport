import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  ComponentUsage,
  marketplaceComponentUsagesList,
  MarketplaceComponentUsagesListData,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatUsageValue } from '@waldur/core/formatNumber';
import { translate } from '@waldur/i18n';
import { getStartAndEndDatesOfMonth } from '@waldur/issues/utils';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ReportingTitle } from '../ReportingTitle';
import { usageTableTabs } from '../utils';

import { FORM_ID, ResourceUsageFilter } from './ResourceUsageFilter';
import { UsageExpandableRow } from './UserUsageExpandableRow';

export const mapStateToFilter = createSelector(
  getFormValues(FORM_ID),
  (usageFilter: any) => {
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
      if (usageFilter.organization) {
        filter.customer_uuid = usageFilter.organization.uuid;
      }
      if (usageFilter.project) {
        filter.project_uuid = usageFilter.project.uuid;
      }
      if (usageFilter.offering) {
        filter.offering_uuid = usageFilter.offering.uuid;
      }
      if (usageFilter.resource) {
        filter.resource_uuid = usageFilter.resource.uuid;
      }
    }
    return filter;
  },
);

export const ResourceUsageList: FC = () => {
  const filter = useSelector(mapStateToFilter);
  const tableProps = useTable({
    table: 'ResourceUsageReports',
    fetchData: createFetcher(marketplaceComponentUsagesList),
    filter,
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
      filter: 'organization',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
      export: 'customer_name',
    },
    {
      title: translate('Client project'),
      render: ({ row }) => <>{row.project_name}</>,
      filter: 'project',
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
    <>
      <ReportingTitle reportKey="resource-usage" />
      <Table
        {...tableProps}
        columns={columns}
        tabs={usageTableTabs}
        verboseName={translate('Usages')}
        showPageSizeSelector={true}
        enableExport={true}
        expandableRow={({ row }) => (
          <UsageExpandableRow row={row} type="resource-usage" />
        )}
        filters={<ResourceUsageFilter form={FORM_ID} />}
      />
    </>
  );
};
