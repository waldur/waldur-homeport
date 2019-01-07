import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

export const TableComponent = props => {
  const { translate } = props;
  const columns = [
    {
      title: translate('Date'),
      render: ({ row }) => row.date,
    },
    {
      title: translate('Value'),
      render: ({ row }) => row.usage,
    },
    {
      title: translate('Type'),
      render: ({ row }) => row.type,
    },
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Unit'),
      render: ({ row }) => row.measured_unit,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Usages')}
      showPageSizeSelector={true}
    />
  );
};

const TableOptions = {
  table: 'ResourceUsages',
  fetchData: createFetcher('marketplace-component-usages'),
  mapPropsToFilter: props => ({resource_uuid: props.resource_uuid}),
  exportRow: row => [
    row.date,
    row.usage,
    row.type,
    row.name,
    row.measured_unit,
  ],
  exportFields: [
    'Date',
    'Value',
    'Type',
    'Name',
    'Unit',
  ],
};

export const ResourceUsagesList = withTranslation(connectTable(TableOptions)(TableComponent));
