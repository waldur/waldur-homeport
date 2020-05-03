import * as React from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { Customer } from '@waldur/customer/types';
import { translate } from '@waldur/i18n';
import { createFetcher, Table, connectTable } from '@waldur/table-react';
import { TableProps } from '@waldur/table-react/Table';
import { Column, TableOptionsType } from '@waldur/table-react/types';
import { renderFieldOrDash } from '@waldur/table-react/utils';

const AbbreviationField = ({ row }) => (
  <span>{renderFieldOrDash(row.abbreviation)}</span>
);

const CreatedDateField = ({ row }) => (
  <span>{renderFieldOrDash(formatDate(row.created))}</span>
);

const TableComponent = (
  props: TableProps<Customer> & { provider_uuid: string },
) => {
  const columns: Array<Column<Customer & { vm_count: number }>> = [
    {
      title: translate('Organization'),
      render: OrganizationLink,
    },
    {
      title: translate('Abbreviation'),
      render: AbbreviationField,
    },
    {
      title: translate('Created'),
      render: CreatedDateField,
    },
    {
      title: translate('VMs'),
      render: ({ row }) => <span>{row.vm_count}</span>,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('organizations')}
      showPageSizeSelector={true}
      enableExport={true}
    />
  );
};

const exportRow = (row: Customer) => [
  row.name,
  row.abbreviation,
  formatDate(row.created),
];

const exportFields = () => [
  translate('Organization'),
  translate('Abbreviation'),
  translate('Created'),
];

const mapPropsToFilter = props => ({
  service_settings_uuid: props.provider_uuid,
});

const TableOptions: TableOptionsType = {
  table: 'SharedProviderCustomers',
  fetchData: createFetcher('openstack-shared-settings-customers'),
  exportRow,
  exportFields,
  mapPropsToFilter,
  exportAll: true,
};

export const SharedProviderCustomers = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<{ provider_uuid: string }>;
