import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { ServiceProviderOfferingsListExpandableRow } from '@waldur/marketplace/offerings/ServiceProviderOfferingsListExpandableRow';
import { SERVICE_PROVIDER_OFFERING_TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { connectTable, createFetcher, Table } from '@waldur/table';

import { Offering } from '../types';

import { OfferingsListTablePlaceholder } from './OfferingsListTablePlaceholder';
import { OfferingStateCell } from './OfferingStateCell';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      orderField: 'name',
    },
    {
      title: translate('Description'),
      render: ({ row }) => <FormattedHtml html={row.description} />,
    },

    {
      title: translate('Category'),
      render: ({ row }) => row.category_title,
    },
    {
      title: translate('State'),
      render: OfferingStateCell,
    },
  ];

  return (
    <Table
      {...props}
      placeholderComponent={<OfferingsListTablePlaceholder />}
      columns={columns}
      verboseName={translate('Service provider offerings')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      expandableRow={ServiceProviderOfferingsListExpandableRow}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, boolean | string> = {
    billable: true,
    shared: true,
    customer_uuid: props.serviceProviderUuid,
  };
  return filter;
};

export const TableOptions = {
  table: SERVICE_PROVIDER_OFFERING_TABLE_NAME,
  fetchData: createFetcher('marketplace-offerings'),
  mapPropsToFilter,
  exportRow: (row: Offering) => [
    row.name,
    formatDateTime(row.created),
    row.category_title,
    row.state,
  ],
  exportFields: ['Name', 'Created', 'Category', 'State'],
};

export const ServiceProviderOfferingsList = connectTable(TableOptions)(
  TableComponent,
);
