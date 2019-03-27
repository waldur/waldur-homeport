import * as React from 'react';

import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

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

const TableOptions = {
  table: 'SupportUsageReports',
  fetchData: createFetcher('marketplace-component-usages'),
  exportRow,
  exportFields,
};

export const SupportUsageList = connectTable(TableOptions)(TableComponent);
