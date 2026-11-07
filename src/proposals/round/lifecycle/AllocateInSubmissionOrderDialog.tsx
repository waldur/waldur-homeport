import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  AllocateInSubmissionOrderResponse,
  AllocationPlanBudget,
  AllocationPlanRow,
  OnDepletedEnum,
  proposalProtectedCallsRoundsAllocateInSubmissionOrder,
  ProtectedRound,
  RoundStepProposalResult,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { RadioGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  BUDGET_QUERIES,
  formatBudgetAmount,
  getOnDepletedOptions,
  getPlannedOutcomeLabel,
  getWaitingRefusal,
} from '@/proposals/budgets';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface AllocateInSubmissionOrderDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

interface AllocateFormValues {
  on_depleted: OnDepletedEnum;
  reason?: string;
}

const useRowsTable = <T,>(table: string, rows: T[]) => {
  const fetchData = useCallback(
    () => Promise.resolve({ rows, resultCount: rows.length }),
    [rows],
  );
  return useTable({ table, fetchData });
};

const planColumns: Column<AllocationPlanRow>[] = [
  { title: '#', render: ({ row }) => row.order },
  {
    title: translate('Proposal'),
    render: ({ row }) => (
      <span className="font-medium text-primary">
        {row.proposal_slug || row.proposal_name}
      </span>
    ),
  },
  {
    title: translate('Submitted'),
    render: ({ row }) =>
      row.submitted_at
        ? formatDateTime(row.submitted_at)
        : renderFieldOrDash(null),
  },
  {
    title: translate('Score'),
    render: ({ row }) =>
      row.threshold === null
        ? renderFieldOrDash(row.score)
        : `${row.score ?? translate('none yet')} / ${row.threshold}`,
  },
  {
    title: translate('Award'),
    render: ({ row }) =>
      row.award.length
        ? row.award
            .map(
              (item) =>
                `${item.offering_name} / ${item.component_type}: ${item.amount}`,
            )
            .join(', ')
        : renderFieldOrDash(null),
  },
  {
    title: translate('Planned'),
    render: ({ row }) => getPlannedOutcomeLabel(row.planned_outcome),
  },
  {
    title: translate('Reason'),
    render: ({ row }) => renderFieldOrDash(row.reason),
  },
];

const budgetColumns: Column<AllocationPlanBudget>[] = [
  {
    title: translate('Pool'),
    render: ({ row }) =>
      `${row.offering_name} / ${row.component_type} (${
        row.round_name || translate('whole call')
      })`,
  },
  {
    title: translate('Offered'),
    render: ({ row }) => formatBudgetAmount(row.offered_total),
  },
  {
    title: translate('Remaining now'),
    render: ({ row }) => formatBudgetAmount(row.remaining_before),
  },
  {
    title: translate('Remaining after'),
    render: ({ row }) => formatBudgetAmount(row.remaining_after),
  },
];

const PlanTables: FC<{
  roundUuid: string;
  plan: AllocateInSubmissionOrderResponse;
}> = ({ roundUuid, plan }) => {
  const planTable = useRowsTable(`AllocationPlan-${roundUuid}`, plan.plan);
  const budgetTable = useRowsTable(
    `AllocationPlanBudgets-${roundUuid}`,
    plan.budgets,
  );
  return (
    <>
      <Table<AllocationPlanRow>
        {...planTable}
        columns={planColumns}
        verboseName={translate('proposals at the allocation decision')}
        hideTitle
        hasActionBar={false}
        placeholderHasRetry={false}
      />
      {plan.has_budget ? (
        <div className="mt-4">
          <p className="font-medium mb-1.5">
            {translate('Resource pools the round draws on')}
          </p>
          <Table<AllocationPlanBudget>
            {...budgetTable}
            columns={budgetColumns}
            verboseName={translate('budgets')}
            hideTitle
            hasActionBar={false}
            placeholderHasRetry={false}
          />
        </div>
      ) : (
        <AlertItem
          type="floating"
          variant="info"
          className="mt-4"
          title={translate('No budget defined for this round')}
          body={translate(
            'Every proposal that passes its gates is approved, in submission order.',
          )}
          data-testid="no-budget"
        />
      )}
    </>
  );
};

const ResultList: FC<{ title: string; entries: RoundStepProposalResult[] }> = ({
  title,
  entries,
}) =>
  entries.length ? (
    <div className="mt-3">
      <p className="font-medium mb-1">{title}</p>
      <ul className="mb-0">
        {entries.map((entry) => (
          <li key={entry.proposal_uuid}>
            {entry.proposal_name}: {entry.detail}
          </li>
        ))}
      </ul>
    </div>
  ) : null;

/** Reloads the preview whenever the choice for depleted budgets changes. */
const PreviewOnChange: FC<{ load(values: AllocateFormValues): void }> = ({
  load,
}) => {
  const { values } = useFormState<AllocateFormValues>({
    subscription: { values: true },
  });
  const onDepleted = values.on_depleted;
  useEffect(() => {
    load({ on_depleted: onDepleted });
    // Only the choice reloads the plan; the reason is typed meanwhile.
  }, [onDepleted]);
  return null;
};

/**
 * Allocates the round first come, first served: the plan lists every
 * proposal at the allocation decision in submission order with what will
 * happen to it, and confirming takes those decisions.
 */
export const AllocateInSubmissionOrderDialog: FC<
  AllocateInSubmissionOrderDialogProps
> = ({ resolve: { round, call, refetch } }) => {
  const { showErrorResponse } = useNotify();
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState<AllocateInSubmissionOrderResponse>();
  const [refusal, setRefusal] = useState<{
    count: number;
    detail: string;
  } | null>(null);
  const [result, setResult] = useState<AllocateInSubmissionOrderResponse>();
  const path = useMemo(
    () => ({ uuid: call.uuid, obj_uuid: round.uuid }),
    [call.uuid, round.uuid],
  );

  const run = useManagedMutation<
    AllocateInSubmissionOrderResponse,
    any,
    AllocateFormValues & { preview: boolean }
  >({
    mutationFn: ({ preview, on_depleted, reason }) =>
      proposalProtectedCallsRoundsAllocateInSubmissionOrder({
        path,
        body: {
          preview,
          on_depleted,
          ...(refusal ? { force: true, reason } : {}),
        },
      }).then((response) => response.data),
    refetch,
    closeModal: false,
    onSuccess: (data) => {
      if (data.preview) {
        setPlan(data);
      } else {
        setResult(data);
        // The decisions taken change what the budgets have awarded.
        BUDGET_QUERIES.forEach((filters) =>
          queryClient.invalidateQueries(filters),
        );
      }
    },
    onError: (error) => {
      const waiting = getWaitingRefusal(error);
      if (waiting) {
        setRefusal(waiting);
        setPlan(undefined);
        return;
      }
      showErrorResponse(error, translate('Unable to allocate the round.'));
    },
  });
  const { mutate } = run;
  const load = useCallback(
    (values: AllocateFormValues) => mutate({ ...values, preview: true }),
    [mutate],
  );

  if (result) {
    return (
      <ModalDialog
        title={translate('Round allocated')}
        footer={<CloseDialogButton variant="tertiary" />}
      >
        <p data-testid="allocation-summary">
          {translate(
            '{completed} decided, {skipped} skipped, {failed} failed.',
            {
              completed: result.completed.length,
              skipped: result.skipped.length,
              failed: result.failed.length,
            },
          )}
        </p>
        <ResultList title={translate('Decided')} entries={result.completed} />
        <ResultList title={translate('Skipped')} entries={result.skipped} />
        <ResultList title={translate('Failed')} entries={result.failed} />
      </ModalDialog>
    );
  }

  return (
    <Form<AllocateFormValues>
      initialValues={{ on_depleted: 'decline' }}
      onSubmit={(values) => mutate({ ...values, preview: false })}
      render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <PreviewOnChange load={load} />
          <ModalDialog
            title={translate('Allocate {name} in submission order', {
              name: round.name,
            })}
            subtitle={translate(
              'Proposals at the allocation decision are approved in the order they were submitted while their award fits what remains of the budgets. Those below the quality threshold are declined.',
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                {refusal && (
                  <SubmitButton
                    type="button"
                    variant="tertiary"
                    label={translate('Preview anyway')}
                    submitting={run.isPending}
                    disabled={!values.reason?.trim()}
                    disabledReason={translate('Give a reason first.')}
                    onClick={() => load(values)}
                  />
                )}
                <SubmitButton
                  label={translate('Allocate')}
                  submitting={run.isPending}
                  disabled={!plan?.plan.length}
                  disabledReason={
                    !plan
                      ? translate('Load the plan first.')
                      : translate(
                          'No proposal of the round is at the allocation decision.',
                        )
                  }
                />
              </>
            }
          >
            <RadioGroup
              name="on_depleted"
              label={translate('A proposal that no longer fits the budget')}
              choices={getOnDepletedOptions()}
              description={translate(
                'Either way, a later and smaller proposal still gets its chance.',
              )}
            />
            {refusal && (
              <>
                <AlertItem
                  type="floating"
                  variant="warning"
                  className="mb-3"
                  title={translate(
                    '{count} proposal(s) of this round have not reached the allocation decision',
                    { count: refusal.count },
                  )}
                  body={translate(
                    'An earlier submission could be overtaken. To allocate the others now, give a reason; it is recorded.',
                  )}
                  data-testid="waiting-refusal"
                />
                <TextGroup
                  name="reason"
                  label={translate('Reason for allocating now')}
                  required
                  maxLength={1000}
                />
              </>
            )}
            {run.isPending && !plan ? (
              <LoadingSpinner />
            ) : plan ? (
              <PlanTables roundUuid={round.uuid} plan={plan} />
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
