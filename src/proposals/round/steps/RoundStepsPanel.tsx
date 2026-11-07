import { FC, useCallback } from 'react';
import {
  proposalProtectedCallsRoundsAdvanceWorkflowStep,
  proposalProtectedCallsRoundsRetrieve,
  RoundStep,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RoundScopedBadge } from '@/proposals/workflow/RoundScopedBadge';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { roundStepState } from './roundSteps';

const OpenRoundStepDialog = lazyComponent(() =>
  import('./OpenRoundStepDialog').then((m) => ({
    default: m.OpenRoundStepDialog,
  })),
);
const RoundStepDueDateDialog = lazyComponent(() =>
  import('./RoundStepDueDateDialog').then((m) => ({
    default: m.RoundStepDueDateDialog,
  })),
);

interface RoundStepsPanelProps {
  callUuid: string;
  round: { uuid: string; name: string };
  /** The call's managers open steps, set due dates and move proposals on. */
  canEdit: boolean;
  refetch(): void;
}

const AdvanceButton: FC<{
  callUuid: string;
  round: RoundStepsPanelProps['round'];
  step: RoundStep;
  refetch(): void;
}> = ({ callUuid, round, step, refetch }) => {
  const advance = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProtectedCallsRoundsAdvanceWorkflowStep({
        path: { uuid: callUuid, obj_uuid: round.uuid },
        body: { step_uuid: step.step_uuid },
      }),
    confirmation: {
      title: translate('Move proposals on'),
      body: translate(
        'Move the {count} proposal(s) waiting after {step} on to their next step?',
        { count: step.proposals_awaiting_advance, step: step.step_name },
      ),
    },
    successMessage: translate('The proposals have been moved on.'),
    errorMessage: translate('Unable to move the proposals on.'),
    refetch,
  });
  return (
    <BaseButton
      label={translate('Move on ({count})', {
        count: step.proposals_awaiting_advance,
      })}
      variant="tertiary"
      size="sm"
      pending={advance.isPending}
      onClick={() => advance.mutate()}
    />
  );
};

/**
 * The call's steps in this round: when each is due here, how many proposals
 * stand before it, at it, and wait after it to be moved on; for a step run
 * once per round, whether it was opened and how many of its round reports are
 * in. The call's managers open such a step, set due dates per round and move
 * the round's proposals on together.
 */
export const RoundStepsPanel: FC<RoundStepsPanelProps> = ({
  callUuid,
  round,
  canEdit,
  refetch: parentRefetch,
}) => {
  const { openDialog } = useModal();
  const fetchData = useCallback(
    () =>
      proposalProtectedCallsRoundsRetrieve({
        path: { uuid: callUuid, obj_uuid: round.uuid },
      }).then((response) => ({
        rows: response.data.round_steps,
        resultCount: response.data.round_steps.length,
      })),
    [callUuid, round.uuid],
  );
  const tableProps = useTable({
    table: `RoundSteps-${round.uuid}`,
    fetchData,
  });
  const refetch = useCallback(() => {
    tableProps.fetch();
    parentRefetch();
  }, [tableProps.fetch, parentRefetch]);

  const rowActions = useCallback(
    ({ row: step }: { row: RoundStep }) => (
      <div className="flex flex-wrap justify-end gap-1.5">
        {step.round_scoped ? (
          <BaseButton
            label={
              step.opened_at
                ? translate('Open again')
                : translate('Open for round')
            }
            variant={step.opened_at ? 'tertiary' : 'primary'}
            size="sm"
            onClick={() =>
              openDialog(OpenRoundStepDialog, {
                resolve: { callUuid, round, step, refetch },
              })
            }
          />
        ) : null}
        {step.proposals_awaiting_advance ? (
          <AdvanceButton
            callUuid={callUuid}
            round={round}
            step={step}
            refetch={refetch}
          />
        ) : null}
        <BaseButton
          label={translate('Due date')}
          variant="tertiary"
          size="sm"
          onClick={() =>
            openDialog(RoundStepDueDateDialog, {
              resolve: { callUuid, round, step, refetch },
            })
          }
        />
      </div>
    ),
    [callUuid, round, refetch, openDialog],
  );

  return (
    <Table<RoundStep>
      {...tableProps}
      id={`round-steps-${round.uuid}`}
      title={translate('Steps')}
      hasActionBar={false}
      minHeight="auto"
      initialPageSize={5}
      verboseName={translate('steps')}
      emptyMessage={translate('The call has no enabled step.')}
      columns={[
        {
          title: translate('Step'),
          render: ({ row }) => (
            <span>
              <span className="font-medium text-primary">{row.step_name}</span>
              {row.round_scoped ? (
                <RoundScopedBadge className="ms-1.5" />
              ) : null}
            </span>
          ),
          width: '30%',
          ellipsis: false,
        },
        {
          title: translate('Due in this round'),
          render: ({ row }) => (
            <>
              {row.due_at
                ? formatDateTime(row.due_at)
                : renderFieldOrDash(null)}
            </>
          ),
          width: '20%',
        },
        {
          title: translate('Before / at the step'),
          render: ({ row }) => (
            <>
              {row.proposals_before_step} / {row.proposals_at_step}
            </>
          ),
          width: '15%',
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <>{roundStepState(row) || renderFieldOrDash(null)}</>
          ),
          width: '35%',
          ellipsis: false,
        },
      ]}
      rowActions={canEdit ? rowActions : undefined}
    />
  );
};
