import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

import { FORM_ID } from './SupportUsageFilter';

const UsageExpandableRow = ({ row }) => (
  <p>
    <strong>{translate('Comment')}</strong>: {row.description || 'N/A'}
  </p>
);

const TableComponent = props => {
  const columns = [
    {
      title: translate('Client organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Client project'),
      render: ({ row }) => row.project_name,
    },
    {
      title: translate('Offering type'),
      render: ({ row }) => row.offering_type,
    },
    {
      title: translate('Resource name'),
      render: ({ row }) => row.resource_name,
    },
    {
      title: translate('Plan component name'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Date of reporting'),
      render: ({ row }) => row.created,
    },
    {
      title: translate('Value'),
      render: ({ row }) => row.usage + ' ' + row.measured_unit,
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

const exportRow = row => [
  row.customer_name,
  row.project_name,
  row.offering_type,
  row.resource_name,
  row.name,
  row.created,
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
  const filter: Record<string, string> = {};
  if (props.usageFilter) {
    filter.accounting_period = props.usageFilter.accounting_period;
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
