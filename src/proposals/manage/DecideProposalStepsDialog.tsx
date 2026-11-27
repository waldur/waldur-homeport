import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Form } from 'react-final-form';
import {
  BulkStepDecision,
  DecidableWorkflowStep,
  OutcomeEnum,
  Proposal,
  proposalProtectedCallsDecidableWorkflowSteps,
  proposalProtectedCallsDecideWorkflowSteps,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { RadioGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { outcomeLabel } from '@/proposals/workflow/constants';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';
import { useNotify } from '@/store/notify';

import { BulkStepDecisionResults } from './BulkStepDecisionResults';
import {
  invalidateRunsOfCall,
  isFinished,
  MAX_BULK_PROPOSALS,
  useBulkStepDecision,
} from './bulkSteps';

interface DecideValues {
  step: string;
  outcome: OutcomeEnum;
  outcome_reason?: string;
}

interface DecideProposalStepsDialogProps {
  resolve: {
    callUuid: string;
    proposals: Pick<Proposal, 'uuid' | 'name'>[];
    refetch?(): void;
  };
}

/**
 * A call manager takes one decision step -- the administrative or
 * eligibility check, say -- for a selection of proposals at once: one
 * outcome, one reason. The backend decides each proposal as from its own
 * page, in its own transaction, so its gates still decide. The manager
 * sees first which proposals will be decided and which refused, and why;
 * then confirms. A large selection is decided in the background: the
 * dialog follows its progress, and may be closed meanwhile.
 */
export const DecideProposalStepsDialog: FC<DecideProposalStepsDialogProps> = ({
  resolve: { callUuid, proposals, refetch },
}) => {
  const queryClient = useQueryClient();
  const { showErrorResponse } = useNotify();
  const [preview, setPreview] = useState<{
    values: DecideValues;
    group: DecidableWorkflowStep;
    result: BulkStepDecision;
  }>();
  const [run, setRun] = useState<BulkStepDecision>();
  const [deciding, setDeciding] = useState(false);
  const proposalUuids = useMemo(
    () => proposals.map((proposal) => proposal.uuid),
    [proposals],
  );

  const tooMany = proposalUuids.length > MAX_BULK_PROPOSALS;
  const {
    data: groups,
    isLoading,
    isError,
    refetch: readStepsAgain,
  } = useQuery({
    queryKey: ['BulkDecisionSteps', callUuid, proposalUuids],
    queryFn: () =>
      proposalProtectedCallsDecidableWorkflowSteps({
        path: { uuid: callUuid },
        body: { proposal_uuids: proposalUuids },
      }).then((response) => response.data),
    enabled: !tooMany,
    refetchOnWindowFocus: false,
  });

  // A large preview, and a large run, go on in the background: both are
  // read again until they stop.
  const { data: previewRun } = useBulkStepDecision(
    preview?.result.uuid ?? '',
    preview?.result.uuid ? preview.result : undefined,
  );
  const { data: runData } = useBulkStepDecision(run?.uuid ?? '', run);
  const shownPreview = preview?.result.uuid ? previewRun : preview?.result;
  const shownRun = runData ?? run;

  const stepChoices = useMemo(
    () =>
      (groups ?? []).map((group) => ({
        value: group.call_step_uuid,
        label: translate('{step} ({count})', {
          step: group.step_name,
          count: group.proposal_uuids.length,
        }),
      })),
    [groups],
  );

  const request = (
    values: DecideValues,
    group: DecidableWorkflowStep,
    dryRun: boolean,
  ) =>
    proposalProtectedCallsDecideWorkflowSteps({
      path: { uuid: callUuid },
      body: {
        call_step_uuid: group.call_step_uuid,
        outcome: values.outcome,
        outcome_reason: values.outcome_reason || '',
        proposal_uuids: group.proposal_uuids,
        dry_run: dryRun,
      },
    }).then((response) => response.data);

  const showPreview = async (values: DecideValues) => {
    const group = groups.find((g) => g.call_step_uuid === values.step);
    try {
      setPreview({ values, group, result: await request(values, group, true) });
    } catch (error) {
      showErrorResponse(error, translate('Unable to check the proposals.'));
    }
  };

  const decide = async () => {
    setDeciding(true);
    try {
      setRun(await request(preview.values, preview.group, false));
      // The call's runs are watched again: this one ends in the background.
      invalidateRunsOfCall(queryClient, callUuid);
    } catch (error) {
      showErrorResponse(error, translate('Unable to decide the step.'));
    } finally {
      setDeciding(false);
    }
  };

  // Once the run stops, what it changed is read again: the proposals list,
  // each decided proposal's steps, the steps the selection stands on, and
  // the call's runs.
  const reported = useRef(false);
  useEffect(() => {
    if (reported.current || !shownRun || !isFinished(shownRun)) return;
    reported.current = true;
    (shownRun.results ?? [])
      .filter((result) => result.status === 'decided')
      .forEach((result) =>
        queryClient.invalidateQueries({
          queryKey: proposalWorkflowStatesKey(result.proposal_uuid),
        }),
      );
    queryClient.invalidateQueries({
      queryKey: ['BulkDecisionSteps', callUuid],
    });
    queryClient.invalidateQueries({
      queryKey: ['BulkStepDecisions', callUuid],
    });
    if (shownRun.decided_count) refetch?.();
  }, [shownRun, queryClient, callUuid, refetch]);

  const title = translate('Decide a step ({count} selected)', {
    count: proposals.length,
  });

  if (tooMany) {
    return (
      <ModalDialog title={title} footer={<CloseDialogButton />}>
        <p className="mb-0">
          {translate(
            'A step is decided for at most {max} proposals at once. Select fewer, or filter the list first.',
            { max: MAX_BULK_PROPOSALS },
          )}
        </p>
      </ModalDialog>
    );
  }

  if (isLoading) {
    return (
      <ModalDialog title={title} footer={<CloseDialogButton />}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  if (isError) {
    return (
      <ModalDialog
        title={title}
        footer={
          <>
            <CloseDialogButton variant="tertiary" />
            <BaseButton
              variant="primary"
              label={translate('Try again')}
              onClick={() => readStepsAgain()}
            />
          </>
        }
      >
        <p className="mb-0">
          {translate(
            'Unable to read which steps the selected proposals stand on.',
          )}
        </p>
      </ModalDialog>
    );
  }

  if (run) {
    return (
      <ModalDialog
        title={title}
        footer={<CloseDialogButton label={translate('Done')} />}
      >
        <BulkStepDecisionResults
          run={shownRun}
          leftAlone={proposals.length - preview.group.proposal_uuids.length}
        />
      </ModalDialog>
    );
  }

  if (preview) {
    const previewDone = isFinished(shownPreview);
    const willDecide = previewDone ? shownPreview.decided_count : 0;
    return (
      <ModalDialog
        title={title}
        subtitle={translate(
          'Nothing has been decided yet. This is what deciding the step would do now; confirm to decide.',
        )}
        footer={
          <>
            <BaseButton
              variant="tertiary"
              label={translate('Back')}
              onClick={() => setPreview(undefined)}
            />
            {previewDone && willDecide > 0 && (
              <SubmitButton
                submitting={deciding}
                onClick={decide}
                label={translate('Decide ({count})', { count: willDecide })}
              />
            )}
          </>
        }
      >
        <BulkStepDecisionResults
          run={shownPreview ?? preview.result}
          leftAlone={proposals.length - preview.group.proposal_uuids.length}
        />
      </ModalDialog>
    );
  }

  if (!groups?.length) {
    return (
      <ModalDialog title={title} footer={<CloseDialogButton />}>
        <p className="mb-0">
          {translate(
            'None of the selected proposals is at a decision step that can be taken for several at once. The allocation decision, assessments and steps taken per round are decided on each proposal.',
          )}
        </p>
      </ModalDialog>
    );
  }

  return (
    <Form<DecideValues>
      onSubmit={showPreview}
      initialValues={{ step: groups[0].call_step_uuid }}
    >
      {({ handleSubmit, submitting, values }) => {
        const group = groups.find((g) => g.call_step_uuid === values.step);
        const leftAlone =
          proposals.length - (group?.proposal_uuids.length ?? 0);
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={title}
              subtitle={translate(
                'One outcome and reason for every selected proposal standing on the step. You see first which proposals will be decided and which refused, and why.',
              )}
              footer={
                <>
                  <CloseDialogButton variant="tertiary" />
                  <SubmitButton
                    submitting={submitting}
                    label={translate('Preview ({count})', {
                      count: group?.proposal_uuids.length ?? 0,
                    })}
                  />
                </>
              }
            >
              {groups.length > 1 && (
                <RadioGroup
                  name="step"
                  label={translate('Step')}
                  required
                  choices={stepChoices}
                />
              )}
              <RadioGroup
                key={values.step}
                name="outcome"
                label={translate('Outcome')}
                required
                validate={(value) =>
                  required(value) ||
                  (group?.allowed_outcomes.includes(value)
                    ? undefined
                    : translate('Choose an outcome of this step.'))
                }
                choices={(group?.allowed_outcomes ?? []).map((outcome) => ({
                  value: outcome,
                  label: outcomeLabel(outcome),
                }))}
              />
              <TextGroup
                name="outcome_reason"
                label={translate('Reason')}
                description={translate(
                  'Recorded on each proposal with the outcome.',
                )}
              />
              {leftAlone > 0 && (
                <p className="text-tertiary mb-0">
                  {groups.length > 1
                    ? translate('Not at this step, so left alone: {count}', {
                        count: leftAlone,
                      })
                    : translate('Not at {step}, so left alone: {count}', {
                        count: leftAlone,
                        step: group?.step_name,
                      })}
                </p>
              )}
            </ModalDialog>
          </form>
        );
      }}
    </Form>
  );
};
