import * as React from 'react';

import { translate } from '@waldur/i18n';
import { fetchInvoicesStats } from '@waldur/invoices/api';
import { INVOICES_STATS_TABLE } from '@waldur/invoices/constants';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { connectTable, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

const CostField = ({ invoiceStats, organization }) =>
  getActiveFixedPricePaymentProfile(organization.payment_profiles)
    ? DASH_ESCAPE_CODE
    : invoiceStats.aggregated_cost;

const TableComponent = (props: any) => {
  const columns = [
    {
      title: translate('Offering name'),
      render: ({ row }) => row.offering_name,
    },
    {
      title: translate('Service provider'),
      render: ({ row }) => row.service_provider_name,
    },
    {
      title: translate('Category name'),
      render: ({ row }) => row.service_category_title,
    },
    {
      title: translate('Cost'),
      render: ({ row }) => (
        <CostField invoiceStats={row} organization={props.organization} />
      ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Invoice statistics')}
      showPageSizeSelector={true}
    />
  );
};

const TableOptions = {
  table: INVOICES_STATS_TABLE,
  mapPropsToTableId: (props) => [props.invoiceUuid],
  fetchData: fetchInvoicesStats,
  mapPropsToFilter: (props) => ({
    invoice_uuid: props.invoiceUuid,
  }),
};

export const InvoicesStatsList = connectTable(TableOptions)(TableComponent);
