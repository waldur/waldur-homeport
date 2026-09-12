import { FunctionComponent } from 'react';
import { Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BillingTypeBadge } from '@/marketplace/common/billingTypes';
import { getLimitPeriods } from '@/marketplace/offerings/update/components/ComponentLimitPeriodField';
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
        // Labelled as the provider's own Components list labels them, rather
        // than the raw values the API stores ("limit", "month").
        {
          title: translate('Billing type'),
          render: ({ row }) => <BillingTypeBadge component={row} />,
        },
        {
          title: translate('Limit period'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(
                getLimitPeriods().find(
                  (period) => period.value === row.limit_period,
                )?.label,
              )}
            </>
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
