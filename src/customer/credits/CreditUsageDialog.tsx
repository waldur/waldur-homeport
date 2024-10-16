import { FC, useMemo } from 'react';

import { parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

interface CreditUsageDialogProps {
  creditUuid: string;
  customerUuid?: string;
  projectUuid?: string;
}

export const CreditUsageDialog: FC<CreditUsageDialogProps> = (props) => {
  const filter = useMemo(
    () => ({
      credit_uuid: props.creditUuid,
      customer_uuid: props.customerUuid,
      project_uuid: props.projectUuid,
    }),
    [props],
  );

  const tableProps = useTable({
    table: 'credit-usage-' + props.creditUuid,
    filter,
    fetchData: createFetcher('invoice-items'),
    queryField: 'query',
  });

  return (
    <MetronicModalDialog headerLess bodyClassName="p-0">
      <Table
        {...tableProps}
        columns={[
          {
            title: translate('Name'),
            render: ({ row }) => (
              <>
                <div>
                  <strong>
                    {row.details.offering_component_name || row.name}
                  </strong>{' '}
                </div>
                {row.article_code && (
                  <div>
                    <small>
                      {translate('Article code')}: {row.article_code}
                    </small>
                  </div>
                )}
              </>
            ),
          },
          {
            title: translate('Resource'),
            render: ({ row }) => renderFieldOrDash(row.details?.resource_name),
          },
          {
            title: translate('Offering'),
            render: ({ row }) => renderFieldOrDash(row.details?.offering_name),
          },
          {
            title: translate('Year'),
            render: ({ row }) => parseDate(row.start).year,
          },
          {
            title: translate('Month'),
            render: ({ row }) => parseDate(row.start).month,
          },
          {
            title: translate('Amount'),
            render: ({ row }) => <>{defaultCurrency(row.unit_price)}</>,
          },
        ]}
        hasQuery={true}
        title={translate('Credit usage history')}
        initialPageSize={5}
      />
    </MetronicModalDialog>
  );
};
