import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import {
  adminArrowConsumptionRecordsList,
  type ArrowConsumptionRecord,
  type Resource,
} from 'waldur-js-client';

import { AlertItem, Badge, BaseButton } from 'waldur-ui';

import { formatMonth } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { RecordStatus } from '../consumption/RecordStatus';

import { getArrowLicense } from './arrowLicense';

const SyncConsumptionHistoryDialog = lazyComponent(() =>
  import('./SyncConsumptionHistoryDialog').then((module) => ({
    default: module.SyncConsumptionHistoryDialog,
  })),
);

interface ViewConsumptionHistoryDialogProps {
  resolve: {
    resource: Resource;
    refetch?: () => void;
  };
}

export const ViewConsumptionHistoryDialog = ({
  resolve,
}: ViewConsumptionHistoryDialogProps) => {
  const { resource, refetch } = resolve;
  const { openDialog } = useModal();
  const license = getArrowLicense(resource);

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

  const openSync = () =>
    openDialog(SyncConsumptionHistoryDialog, {
      resolve: {
        resource,
        refetch,
        // One dialog at a time: come back here to show what was fetched.
        onSynced: () =>
          openDialog(ViewConsumptionHistoryDialog, {
            resolve: { resource, refetch },
          }),
      },
      size: 'lg',
    });

  return (
    <ModalDialog
      title={translate('Consumption history')}
      subtitle={
        <>
          <span className="font-medium">{resource.name}</span>
          {license && (
            <>
              {' '}
              <span className="text-quaternary">({license})</span>
            </>
          )}
        </>
      }
      footer={
        <>
          <CloseDialogButton label={translate('Close')} />
          {license && (
            <BaseButton
              variant="primary"
              size="lg"
              label={translate('Sync history')}
              iconNode={<ArrowsClockwiseIcon weight="bold" />}
              onClick={openSync}
            />
          )}
        </>
      }
    >
      {license ? (
        <AlertItem
          type="floating"
          variant="info"
          className="mb-3"
          title={translate(
            'One record per month, created when consumption for this license is synced from Arrow.',
          )}
          body={translate(
            'Records appear as the consumption sync runs, or right away with Sync history, which fetches the past months from Arrow.',
          )}
        />
      ) : (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-3"
          title={translate('This resource is not linked to an Arrow license')}
          body={translate(
            'Consumption is tracked per Arrow license. Link the resource to its license first (Link to Arrow license in the row menu, or Link resources on the customer mapping).',
          )}
        />
      )}
      <Table<ArrowConsumptionRecord>
        {...tableProps}
        columns={[
          {
            title: translate('Month'),
            render: ({ row }) => <>{formatMonth(row.billing_period)}</>,
          },
          {
            title: translate('Consumed (sell)'),
            render: ({ row }) => <>{defaultCurrency(row.consumed_sell)}</>,
          },
          {
            title: translate('Final (sell)'),
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
              <div className="flex flex-wrap gap-1">
                <RecordStatus row={row} />
                {row.is_reconciled && (
                  <Badge variant="success" shape="pill" tone="outline">
                    {translate('Reconciled')}
                  </Badge>
                )}
              </div>
            ),
          },
        ]}
        verboseName={translate('consumption records')}
        emptyMessage={
          license
            ? translate(
                'No consumption synced for this license yet. Use Sync history to fetch it from Arrow.',
              )
            : translate('No consumption records: the resource has no license.')
        }
        hideTitle
        hasActionBar={false}
        placeholderHasRetry={false}
        fullWidth
        minHeight="auto"
      />
    </ModalDialog>
  );
};
