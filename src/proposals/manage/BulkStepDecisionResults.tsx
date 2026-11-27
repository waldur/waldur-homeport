import { FC } from 'react';
import { BulkStepDecision, BulkStepDecisionResult } from 'waldur-js-client';

import { AlertItem, Progress } from 'waldur-ui';

import { translate } from '@/i18n';
import { outcomeLabel } from '@/proposals/workflow/constants';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { isFinished, isMoving, refusedOf } from './bulkSteps';

const refusalColumns: Column<BulkStepDecisionResult>[] = [
  {
    title: translate('Proposal'),
    render: ({ row }) => (
      <span className="font-medium">
        {renderFieldOrDash(row.proposal_name || row.proposal_uuid)}
      </span>
    ),
  },
  {
    title: translate('Reason'),
    render: ({ row }) => <span>{row.detail}</span>,
  },
];

/** The refused proposals of a run or a preview, each with the reason. */
const RefusalList: FC<{ results: BulkStepDecisionResult[] }> = ({
  results,
}) => (
  <div className="max-h-72 overflow-y-auto" data-testid="bulk-refusals">
    <SimpleTable<BulkStepDecisionResult>
      columns={refusalColumns}
      rows={results}
    />
  </div>
);

/**
 * What a run deciding one step for many proposals did, or -- for a preview
 * -- would do: how many are decided, and each refused proposal with the
 * reason. While the run goes on in the background, how far it has got.
 */
export const BulkStepDecisionResults: FC<{
  run: BulkStepDecision;
  /** Proposals of the selection not standing on the step. */
  leftAlone?: number;
}> = ({ run, leftAlone = 0 }) => {
  const refused = refusedOf(run.results ?? []);
  const finished = isFinished(run);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-secondary mb-0">
        {translate('{step} as {outcome}', {
          step: run.step_name,
          outcome: outcomeLabel(run.outcome),
        })}
        {run.outcome_reason ? ` — ${run.outcome_reason}` : ''}
      </p>
      {!finished && (
        <div className="flex flex-col gap-1" data-testid="bulk-progress">
          <Progress
            value={run.processed}
            max={run.total || 1}
            label={run.dry_run ? translate('Checking') : translate('Deciding')}
          />
          <span className="text-tertiary">
            {!isMoving(run)
              ? translate(
                  'This run has stopped moving at {processed} of {total}. It is picked up again shortly, or given up and marked as failed.',
                  { processed: run.processed, total: run.total },
                )
              : run.dry_run
                ? translate(
                    'Checking in the background: {processed} of {total}. Nothing is decided yet.',
                    { processed: run.processed, total: run.total },
                  )
                : translate(
                    'Deciding in the background: {processed} of {total}. You can close this dialog and read the result again from the call.',
                    { processed: run.processed, total: run.total },
                  )}
          </span>
        </div>
      )}
      {run.state === 'failed' && (
        <AlertItem
          type="floating"
          variant="error"
          title={translate('The run stopped before it was done.')}
          body={run.error_message}
        />
      )}
      {(run.decided_count > 0 || (finished && !refused.length)) && (
        <AlertItem
          type="floating"
          variant="success"
          title={
            run.dry_run
              ? translate('Will be decided: {count}', {
                  count: run.decided_count,
                })
              : translate('Decided: {count}', { count: run.decided_count })
          }
        />
      )}
      {refused.length > 0 && (
        <AlertItem
          type="floating"
          variant={run.dry_run ? 'warning' : 'error'}
          title={
            run.dry_run
              ? translate('Will be refused: {count}', { count: refused.length })
              : translate('Refused: {count}', { count: refused.length })
          }
          body={<RefusalList results={refused} />}
        />
      )}
      {leftAlone > 0 && (
        <p className="text-tertiary mb-0">
          {translate('Not at this step, so left alone: {count}', {
            count: leftAlone,
          })}
        </p>
      )}
    </div>
  );
};
