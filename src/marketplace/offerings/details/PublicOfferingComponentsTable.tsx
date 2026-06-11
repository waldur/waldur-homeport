import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface PublicOfferingComponentsTableProps {
  offering: Offering;
  hideActionBar?: boolean;
  fullWidth?: boolean;
}

export const PublicOfferingComponentsTable: FunctionComponent<
  PublicOfferingComponentsTableProps
> = ({ offering, hideActionBar, fullWidth }) => {
  const tableProps = useTable({
    table: 'OfferingComponents-' + offering.uuid,
    fetchData: createClientPaginatedFetcher(offering.components),
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Unit'),
          render: ({ row }) => <>{row.measured_unit}</>,
        },
        {
          title: translate('Type'),
          render: ({ row }) => <>{row.billing_type}</>,
        },
        {
          title: translate('Period'),
          render: ({ row }) => (
            <>{typeof row.limit_period === 'string' ? row.limit_period : '—'}</>
          ),
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{renderFieldOrDash(row.description)}</>,
        },
      ]}
      title={translate('Components')}
      verboseName={translate('Components')}
      hideRefresh
      hasActionBar={!hideActionBar}
      fullWidth={fullWidth}
    />
  );
};
