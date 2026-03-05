import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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
    fetchData: () => Promise.resolve({ rows: offering.components }),
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
