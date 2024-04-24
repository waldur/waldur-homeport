import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getStartAndEndDatesOfMonth } from '@waldur/issues/utils';
import {
  UsageReport,
  UsageReportRequest,
} from '@waldur/marketplace/resources/usage/types';
import { Table, createFetcher } from '@waldur/table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/utils';

import { FORM_ID, ResourceUsageFilter } from './ResourceUsageFilter';

const UsageExpandableRow = ({ row }) => (
  <p>
    <strong>{translate('Comment')}</strong>: {row.description || 'N/A'}
  </p>
);

export const ResourceUsageList: FC = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: 'ResourceUsageReports',
    fetchData: createFetcher('marketplace-component-usages'),
    exportRow,
    exportFields,
    filter,
  });
  const columns: Array<Column<UsageReport>> = [
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
    },
    {
      title: translate('Client project'),
      render: ({ row }) => <>{row.project_name}</>,
    },
    {
      title: translate('Offering type'),
      render: ({ row }) => <>{row.offering_name}</>,
    },
    {
      title: translate('Resource name'),
      render: ({ row }) => <>{row.resource_name}</>,
    },
    {
      title: translate('Plan component name'),
      render: ({ row }) => <>{row.name}</>,
    },
    {
      title: translate('Date of reporting'),
      render: ({ row }) => <>{formatDateTime(row.date)}</>,
    },
    {
      title: translate('Value'),
      render: ({ row }) => <>{row.usage + ' ' + row.measured_unit}</>,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Usages')}
      showPageSizeSelector={true}
      enableExport={true}
      expandableRow={UsageExpandableRow}
      filters={<ResourceUsageFilter />}
    />
  );
};

const exportRow = (row: UsageReport) => [
  row.customer_name,
  row.project_name,
  row.offering_name,
  row.resource_name,
  row.name,
  formatDateTime(row.created),
  row.usage + ' ' + row.measured_unit,
  row.description,
];

const exportFields = () => [
  translate('Client organization'),
  translate('Client project'),
  translate('Offering type'),
  translate('Resource name'),
  translate('Plan component name'),
  translate('Date of reporting'),
  translate('Value'),
  translate('Comment'),
];

const mapStateToFilter = createSelector(
  getFormValues(FORM_ID),
  (usageFilter: any) => {
    const filter: UsageReportRequest = {};
    if (usageFilter) {
      if (usageFilter.accounting_period) {
        const { start } = getStartAndEndDatesOfMonth(
          usageFilter.accounting_period.value,
        );
        filter.billing_period = start;
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
    }
    return filter;
  },
);
