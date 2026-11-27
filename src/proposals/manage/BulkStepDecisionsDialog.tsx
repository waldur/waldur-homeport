import { FC, useState } from 'react';
import { BulkStepDecisionSummary } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { outcomeLabel } from '@/proposals/workflow/constants';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { BulkStepDecisionResults } from './BulkStepDecisionResults';
import { useBulkRunsOfCall, useBulkStepDecision } from './bulkSteps';

const stateLabel = (run: BulkStepDecisionSummary) =>
  ({
    pending: translate('Waiting'),
    running: translate('{processed} of {total}', {
      processed: run.processed,
      total: run.total,
    }),
    done: translate('Done'),
    failed: translate('Failed'),
  })[run.state];

const stateVariant = (run: BulkStepDecisionSummary) =>
  (
    ({
      pending: 'neutral',
      running: 'primary',
      done: 'success',
      failed: 'danger',
    }) as const
  )[run.state];

/** A run opened from the list: its results are read when it is opened. */
const RunDetail: FC<{ uuid: string }> = ({ uuid }) => {
  const { data: run, isLoading } = useBulkStepDecision(uuid);
  if (isLoading || !run) return <LoadingSpinner />;
  return <BulkStepDecisionResults run={run} />;
};

/**
 * The runs deciding one step for many proposals of the call, latest first:
 * who ran which, how far a run in the background has got, and -- opened --
 * what came of each proposal.
 */
export const BulkStepDecisionsDialog: FC<{ resolve: { callUuid: string } }> = ({
  resolve: { callUuid },
}) => {
  const [selected, setSelected] = useState<BulkStepDecisionSummary>();
  const { data: runs, isLoading } = useBulkRunsOfCall(callUuid);

  const title = translate('Steps decided in bulk');

  if (selected) {
    return (
      <ModalDialog
        title={title}
        subtitle={translate('Started by {name} on {date}', {
          name: selected.created_by_name || '—',
          date: formatDateTime(selected.created),
        })}
        footer={
          <>
            <BaseButton
              variant="tertiary"
              label={translate('Back')}
              onClick={() => setSelected(undefined)}
            />
            <CloseDialogButton label={translate('Done')} />
          </>
        }
      >
        <RunDetail uuid={selected.uuid} />
      </ModalDialog>
    );
  }

  const columns: Column<BulkStepDecisionSummary>[] = [
    {
      title: translate('Started'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
    },
    {
      title: translate('Step'),
      render: ({ row }) => (
        <>
          {row.step_name}: {outcomeLabel(row.outcome)}
        </>
      ),
    },
    {
      title: translate('By'),
      render: ({ row }) => <>{renderFieldOrDash(row.created_by_name)}</>,
    },
    {
      title: translate('Decided'),
      render: ({ row }) => <>{row.decided_count}</>,
    },
    {
      title: translate('Refused'),
      render: ({ row }) => <>{row.refused_count}</>,
    },
    {
      title: translate('State'),
      render: ({ row }) => (
        <StateIndicator
          label={stateLabel(row)}
          variant={stateVariant(row)}
          tone="outline"
          shape="pill"
        />
      ),
    },
    {
      title: '',
      render: ({ row }) => (
        <BaseButton
          variant="text-primary"
          size="sm"
          label={translate('Open')}
          onClick={() => setSelected(row)}
        />
      ),
    },
  ];

  return (
    <ModalDialog
      title={title}
      footer={<CloseDialogButton label={translate('Done')} />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : runs?.length ? (
        <div className="max-h-96 overflow-y-auto">
          <SimpleTable<BulkStepDecisionSummary> columns={columns} rows={runs} />
        </div>
      ) : (
        <p className="mb-0">
          {translate('No step of this call has been decided in bulk yet.')}
        </p>
      )}
    </ModalDialog>
  );
};
