import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getStartAndEndDatesOfMonth } from '@waldur/issues/utils';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

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

const mapPropsToFilter = (props) => {
  const filter: UsageReportRequest = {};
  if (props.usageFilter) {
    if (props.usageFilter.accounting_period) {
      const { start, end } = getStartAndEndDatesOfMonth(
        props.usageFilter.accounting_period.value,
      );
      filter.date_after = start;
      filter.date_before = end;
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

const mapStateToProps = (state: RootState) => ({
  usageFilter: getFormValues(FORM_ID)(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const SupportUsageList = enhance(TableComponent);
