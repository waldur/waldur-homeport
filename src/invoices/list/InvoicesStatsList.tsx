import { ENV } from '@waldur/configs/default';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { INVOICES_STATS_TABLE } from '@waldur/invoices/constants';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { Table, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';

const CostField = ({ invoiceStats, organization }) =>
  getActiveFixedPricePaymentProfile(organization.payment_profiles)
    ? DASH_ESCAPE_CODE
    : ENV.accountingMode === 'accounting'
      ? defaultCurrency(invoiceStats.aggregated_price)
      : defaultCurrency(invoiceStats.aggregated_total);

export const InvoicesStatsList = (props: any) => {
  const tableProps = useTable({
    table: [INVOICES_STATS_TABLE, props.invoiceUuid].join('-'),
    fetchData: createFetcher(`invoices/${props.invoiceUuid}/stats`),
  });
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
      {...tableProps}
      columns={columns}
      verboseName={translate('Invoice statistics')}
      showPageSizeSelector={true}
    />
  );
};
