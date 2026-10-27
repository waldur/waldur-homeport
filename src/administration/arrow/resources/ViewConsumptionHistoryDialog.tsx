import { useMemo } from 'react';
import {
  adminArrowConsumptionRecordsList,
  type ArrowConsumptionRecord,
  type Resource,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface ViewConsumptionHistoryDialogProps {
  resolve: {
    resource: Resource;
  };
}

export const ViewConsumptionHistoryDialog = ({
  resolve,
}: ViewConsumptionHistoryDialogProps) => {
  const { resource } = resolve;

  // The endpoint pages on the server, so the table fetches it page by page.
  const filter = useMemo(
    () => ({ resource_uuid: resource.uuid }),
    [resource.uuid],
  );
  const tableProps = useTable({
    table: `arrow-consumption-history-${resource.uuid}`,
    fetchData: createFetcher(adminArrowConsumptionRecordsList),
    filter,
  });

  return (
    <ModalDialog
      title={translate('Consumption history')}
      subtitle={
        <>
          <span className="font-medium">{resource.name}</span>
          {resource.backend_id && (
            <>
              {' '}
              <span className="text-quaternary">({resource.backend_id})</span>
            </>
          )}
        </>
      }
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <Table<ArrowConsumptionRecord>
        {...tableProps}
        columns={[
          {
            title: translate('Period'),
            render: ({ row }) => <>{row.billing_period}</>,
          },
          {
            title: translate('Consumed (Sell)'),
            render: ({ row }) => <>{defaultCurrency(row.consumed_sell)}</>,
          },
          {
            title: translate('Final (Sell)'),
            render: ({ row }) => (
              <>
                {row.final_sell
                  ? defaultCurrency(row.final_sell)
                  : DASH_ESCAPE_CODE}
              </>
            ),
          },
          {
            title: translate('Status'),
            render: ({ row }) => (
              <div className="flex flex-col gap-1">
                <Badge
                  variant={row.is_finalized ? 'success' : 'warning'}
                  shape="pill"
                  tone="outline"
                >
                  {row.is_finalized
                    ? translate('Finalized')
                    : translate('Pending')}
                </Badge>
                {row.is_reconciled && (
                  <Badge variant="primary" shape="pill" tone="outline">
                    {translate('Reconciled')}
                  </Badge>
                )}
              </div>
            ),
          },
        ]}
        verboseName={translate('consumption records')}
        emptyMessage={translate(
          'No consumption records found for this resource.',
        )}
        hideTitle
        hasActionBar={false}
        fullWidth
        minHeight="auto"
      />
    </ModalDialog>
  );
};
