import { useMemo } from 'react';
import { invoicesStatsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { INVOICES_STATS_TABLE } from '@/invoices/constants';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

const CostField = ({ invoiceStats, organization }) =>
  getActiveFixedPricePaymentProfile(organization.payment_profiles)
    ? DASH_ESCAPE_CODE
    : ENV.accountingMode === 'accounting'
      ? defaultCurrency(invoiceStats.aggregated_price)
      : defaultCurrency(invoiceStats.aggregated_total);

export const InvoicesStatsList = (props: any) => {
  const filter = useMemo(
    () => ({
      provider_uuid: props.providerUUID,
    }),
    [props.providerUUID],
  );
  const tableProps = useTable({
    table: [INVOICES_STATS_TABLE, props.invoiceUuid].join('-'),
    filter,
    fetchData: createFetcher(invoicesStatsList, {
      path: {
        uuid: props.invoiceUuid,
      },
    }),
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
      hasActionBar={false}
      minHeight="auto"
    />
  );
};
