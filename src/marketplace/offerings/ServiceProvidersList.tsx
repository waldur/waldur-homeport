import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { Link } from '@waldur/core/Link';
import { SERVICE_PROVIDERS_TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

const ServiceProviderNameColumn = ({ row }) => (
  <Link
    state="marketplace-service-provider.details"
    params={{ uuid: row.customer_uuid }}
  >
    {row.customer_name}
  </Link>
);

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;

  const columns = [
    {
      title: translate('Name'),
      render: ServiceProviderNameColumn,
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => row.customer_abbreviation,
    },
    {
      title: translate('Description'),
      render: ({ row }) => <FormattedHtml html={row.description} />,
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Service providers')}
      enableExport={true}
    />
  );
};

export const TableOptions = {
  table: SERVICE_PROVIDERS_TABLE_NAME,
  fetchData: createFetcher('marketplace-service-providers', ANONYMOUS_CONFIG),
  exportRow: (row) => [
    row.customer_name,
    row.customer_abbreviation,
    row.description,
    formatDateTime(row.created),
  ],
  exportFields: ['Name', 'Abbreviation', 'Description', 'Created'],
};

export const ServiceProvidersList = connectTable(TableOptions)(TableComponent);
