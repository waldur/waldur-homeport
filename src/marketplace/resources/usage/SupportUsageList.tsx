import * as moment from 'moment-timezone';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableProps } from '@waldur/table-react/Table';
import { Column } from '@waldur/table-react/types';

import { FORM_ID } from './SupportUsageFilter';
import { UsageReport, UsageReportRequest } from './types';

const UsageExpandableRow = ({ row }) => (
  <p>
    <strong>{translate('Comment')}</strong>: {row.description || 'N/A'}
  </p>
);

const TableComponent = (props: TableProps<UsageReport>) => {
  const columns: Array<Column<UsageReport>> = [
    {
      title: translate('Client organization'),
      render: ({ row }) => <span>{row.customer_name}</span>,
    },
    {
      title: translate('Client project'),
      render: ({ row }) => <span>{row.project_name}</span>,
    },
    {
      title: translate('Offering type'),
      render: ({ row }) => <span>{row.offering_name}</span>,
    },
    {
      title: translate('Resource name'),
      render: ({ row }) => <span>{row.resource_name}</span>,
    },
    {
      title: translate('Plan component name'),
      render: ({ row }) => <span>{row.name}</span>,
    },
    {
      title: translate('Date of reporting'),
      render: ({ row }) => <span>{formatDateTime(row.created)}</span>,
    },
    {
      title: translate('Value'),
      render: ({ row }) => <span>{row.usage + ' ' + row.measured_unit}</span>,
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

const exportFields = () => ([
  translate('Client organization'),
  translate('Client project'),
  translate('Offering type'),
  translate('Resource name'),
  translate('Plan component name'),
  translate('Date of reporting'),
  translate('Value'),
  translate('Comment'),
]);

const mapPropsToFilter = props => {
  const filter: UsageReportRequest = {};
  if (props.usageFilter) {
    if (props.usageFilter.accounting_period) {
      const {year, month} = props.usageFilter.accounting_period.value;
      const dt = moment({year, month: month - 1});
      filter.date_after = dt.startOf('month').format('YYYY-MM-DD');
      filter.date_before = dt.endOf('month').format('YYYY-MM-DD');
    }
    if (props.usageFilter.organization) {
      filter.customer_uuid = props.usageFilter.organization.uuid;
    }
    if (props.usageFilter.project) {
      filter.project_uuid = props.usageFilter.project.uuid;
    }
    if (props.usageFilter.offering) {
      filter.offering_uuid = props.usageFilter.offering.uuid;
    }
  }
  return filter;
};

const TableOptions = {
  table: 'SupportUsageReports',
  fetchData: createFetcher('marketplace-component-usages'),
  exportRow,
  exportFields,
  mapPropsToFilter,
};

const mapStateToProps = state => ({
  usageFilter: getFormValues(FORM_ID)(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const SupportUsageList = enhance(TableComponent);
