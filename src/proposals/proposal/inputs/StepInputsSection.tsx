import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  OutcomeEnum,
  proposalProposalsCompleteWorkflowStep,
  ProposalReview,
  ProposalWorkflowStepInstance,
  StepContributionWithAnswers,
  StepInput,
} from 'waldur-js-client';

import {
  AccordionCard,
  AlertItem,
  Badge,
  BaseButton,
  EmptyState,
} from 'waldur-ui';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Proposal } from '@/proposals/types';
import { outcomeLabel } from '@/proposals/workflow/constants';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';

import {
  proposalContributionsKey,
  useStepContributionAnswers,
} from '../contributions/queries';
import { runPartUnlocked } from '../postAward';
import { sectionOpenProps, useSectionOpenState } from '../sectionOpen';
import { StepChecklistSection } from '../StepChecklistSection';

import {
  isResponseStep,
  readsInputs,
  showsStepInputs,
  stepInputsKey,
  useStepInputs,
} from './queries';
import { StepAnswerValue } from './StepAnswerValue';

const REVIEW_COMMENTS: Array<[keyof ProposalReview, () => string]> = [
  ['comment_project_title', () => translate('Project title')],
  ['comment_project_summary', () => translate('Project summary')],
  ['comment_project_description', () => translate('Project description')],
  [
    'comment_project_supporting_documentation',
    () => translate('Supporting documentation'),
  ],
  ['comment_resource_requests', () => translate('Resource requests')],
  ['comment_team', () => translate('Team')],
];

const Paragraph: FC<{ children: string }> = ({ children }) => (
  <p className="mb-0 whitespace-pre-line">{children}</p>
);

const ReviewOutput: FC<{ review: ProposalReview }> = ({ review }) => {
  const comments = REVIEW_COMMENTS.filter(([field]) => review[field]);
  return (
    <div className="border border-secondary rounded-lg p-3 flex flex-col gap-2.5">
      <div className="flex justify-between items-center gap-2.5">
        <h6 className="mb-0">
          {review.reviewer_full_name ||
            review.anonymous_reviewer_name ||
            translate('Reviewer')}
        </h6>
        {review.summary_score !== null &&
          review.summary_score !== undefined && (
            <Badge variant="info" tone="outline">
              {translate('Score {score}', { score: review.summary_score })}
            </Badge>
          )}
      </div>
      {review.summary_public_comment && (
        <Paragraph>{review.summary_public_comment}</Paragraph>
      )}
      {comments.length > 0 && (
        <dl className="mb-0">
          {comments.map(([field, label]) => (
            <div key={field} className="mb-1.5">
              <dt className="font-semibold">{label()}</dt>
              <dd className="mb-0 whitespace-pre-line">
                {String(review[field])}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {review.summary_private_comment && (
        <div>
          <div className="font-semibold">
            {translate('Private comment (not shown to the applicant)')}
          </div>
          <Paragraph>{review.summary_private_comment}</Paragraph>
        </div>
      )}
    </div>
  );
};

export const ContributionOutput: FC<{
  contribution: StepContributionWithAnswers;
}> = ({ contribution }) => {
  const answers = (contribution.answers ?? []).filter(
    (answer) => answer.answer_display,
  );
  return (
    <div className="border border-secondary rounded-lg p-3 flex flex-col gap-2.5">
      <div className="flex justify-between items-center gap-2.5">
        <h6 className="mb-0">
          {(contribution.is_per_offering
            ? contribution.offering_name
            : contribution.contributor_full_name) || translate('Contribution')}
        </h6>
        {contribution.submitted_at && (
          <span className="text-quaternary text-xs">
            {translate('Submitted {date}', {
              date: formatDate(contribution.submitted_at),
            })}
          </span>
        )}
      </div>
      {contribution.comment && <Paragraph>{contribution.comment}</Paragraph>}
      {answers.length > 0 && (
        <dl className="mb-0">
          {answers.map((answer) => (
            <div key={answer.question_uuid} className="mb-1.5">
              <dt className="font-semibold">{answer.question_description}</dt>
              <dd className="mb-0 whitespace-pre-line">
                <StepAnswerValue answer={answer} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

const InputOutputs: FC<{ output: StepInput }> = ({ output }) => {
  const { step, reviews, contributions } = output;
  const empty = !reviews.length && !contributions.length;
  return (
    <div className="flex flex-col gap-2.5" data-testid="step-input">
      <div className="flex items-center gap-2.5">
        <h5 className="mb-0">{step.step_name}</h5>
        {step.outcome && (
          <Badge variant="neutral" tone="outline">
            {outcomeLabel(step.outcome)}
          </Badge>
        )}
      </div>
      {empty ? (
        <EmptyState
          size="sm"
          message={
            step.status === 'pending'
              ? translate('This step has not started yet.')
              : translate('Nothing to read from this step.')
          }
        />
      ) : (
        <>
          {reviews.map((review) => (
            <ReviewOutput key={review.uuid} review={review} />
          ))}
          {contributions.map((contribution) => (
            <ContributionOutput
              key={contribution.uuid}
              contribution={contribution}
            />
          ))}
        </>
      )}
    </div>
  );
};

/** The card body for a read the backend did not refuse but failed. */
const InputsError: FC = () => (
  <AlertItem
    variant="error"
    type="floating"
    title={translate('Unable to load what the earlier steps produced.')}
  />
);

const InputsList: FC<{ outputs: StepInput[] }> = ({ outputs }) => (
  <div className="flex flex-col gap-5">
    {outputs.map((output) => (
      <InputOutputs key={output.step.uuid} output={output} />
    ))}
  </div>
);

interface StepCardProps {
  proposal: Proposal;
  step: ProposalWorkflowStepInstance;
  /** The proposal's author, who submits an applicant step. */
  isApplicant: boolean;
  refetch?(): void;
}

/**
 * The applicant's response to what earlier steps produced -- the public part
 * of the reviews, the rapporteurs' questions -- with the form they answer it
 * in. Submitted, or lapsed, it stays on the page read-only.
 */
const ResponseStepCard: FC<StepCardProps> = ({
  proposal,
  step,
  isApplicant,
  refetch,
}) => {
  const openState = useSectionOpenState();
  const { data: outputs, isError } = useStepInputs(
    proposal.uuid,
    step.call_step_uuid,
  );
  const active = step.status === 'active';
  const hasInputs = readsInputs(step);
  const hasForm = Boolean(step.checklist_status?.has_checklist);
  // A submission step answers with ``submitted``; an applicant step of
  // another outcome set with the one it offers.
  const outcome = (
    step.allowed_outcomes?.includes('submitted') ||
    !step.allowed_outcomes?.length
      ? 'submitted'
      : step.allowed_outcomes[0]
  ) as OutcomeEnum;
  // Those overseeing the call read the response as the applicant gave it.
  const { data: responses } = useStepContributionAnswers(
    proposal.uuid,
    step.call_step_uuid,
    hasForm && !isApplicant && !active,
  );
  const unanswered = step.checklist_status?.unanswered_required_count ?? 0;

  const submit = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsCompleteWorkflowStep({
        path: { uuid: proposal.uuid },
        body: { step_uuid: step.uuid, outcome },
      }),
    refetch,
    confirmation: {
      title: translate('Submit response'),
      body: translate('Submit your response? It cannot be changed afterwards.'),
    },
    successMessage: translate('Response submitted.'),
    errorMessage: translate('Unable to submit the response.'),
    invalidateQueries: [
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
      { queryKey: proposalContributionsKey(proposal.uuid) },
      { queryKey: stepInputsKey(proposal.uuid, step.call_step_uuid) },
    ],
  });

  if (!showsStepInputs({ data: outputs, isError })) {
    return null;
  }
  return (
    <AccordionCard
      id={`step-response-${step.call_step_uuid}`}
      title={step.step_name}
      subtitle={
        active && step.deadline
          ? translate('Respond by {date}.', {
              date: formatDateTime(step.deadline),
            })
          : step.outcome === 'no_response'
            ? translate('The step ended without a response.')
            : step.outcome === 'submitted'
              ? translate('The response has been submitted.')
              : undefined
      }
      {...sectionOpenProps(
        openState,
        `step-response-${step.call_step_uuid}`,
        true,
      )}
    >
      <div className="flex flex-col gap-5">
        {hasInputs &&
          (outputs ? <InputsList outputs={outputs} /> : <InputsError />)}
        {!hasInputs && !hasForm && active && (
          <AlertItem
            variant="warning"
            type="floating"
            title={translate(
              'This step has no form: submitting it only confirms the step is done.',
            )}
          />
        )}
        {!isApplicant &&
          Object.values(responses ?? {})
            .filter((response) => response.status !== 'declined')
            .map((response) => (
              <ContributionOutput key={response.uuid} contribution={response} />
            ))}
        {hasForm && isApplicant && (
          <StepChecklistSection
            proposal={proposal}
            step={step}
            canEdit={
              (active ||
                // Changes asked in an extension request or final report
                // reopen its form to the team.
                (Boolean(step.run_uuid) &&
                  runPartUnlocked(proposal, 'run_form'))) &&
              isApplicant
            }
            refetch={refetch}
            embedded
          />
        )}
        {active && !isApplicant && (
          <AlertItem
            variant="info"
            type="floating"
            title={translate("The proposal's applicant submits the response.")}
          />
        )}
        {active && isApplicant && (
          <div className="flex justify-end">
            <BaseButton
              variant="primary"
              label={translate('Submit response')}
              iconNode={<PaperPlaneTiltIcon weight="bold" />}
              onClick={() => submit.mutate()}
              pending={submit.isPending}
              disabled={hasForm && unanswered > 0}
              disabledReason={
                hasForm && unanswered > 0
                  ? translate('Save answers to the required questions first.')
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </AccordionCard>
  );
};

/** What the step's contributors and completer read of earlier steps. */
const EvaluatorInputsCard: FC<StepCardProps> = ({ proposal, step }) => {
  const openState = useSectionOpenState();
  const { data: outputs, isError } = useStepInputs(
    proposal.uuid,
    step.call_step_uuid,
  );
  if (!showsStepInputs({ data: outputs, isError })) {
    return null;
  }
  return (
    <AccordionCard
      id={`step-inputs-${step.call_step_uuid}`}
      title={translate('{step}: inputs', { step: step.step_name })}
      subtitle={translate(
        'What the earlier steps this step reads produced for this proposal.',
      )}
      // A step done is kept for reference, folded.
      {...sectionOpenProps(
        openState,
        `step-inputs-${step.call_step_uuid}`,
        step.status === 'active',
      )}
    >
      {outputs ? <InputsList outputs={outputs} /> : <InputsError />}
    </AccordionCard>
  );
};

interface StepInputsSectionProps {
  proposal: Proposal;
  steps: ProposalWorkflowStepInstance[];
  isApplicant: boolean;
  refetch?(): void;
}

/**
 * Earlier steps' outputs on the steps that read them: the applicant's
 * response to reviews, and the inputs of the step running now for those who
 * hold its work. The backend decides who reads what; a step the viewer has
 * no work on shows nothing.
 */
export const StepInputsSection: FC<StepInputsSectionProps> = ({
  proposal,
  steps,
  isApplicant,
  refetch,
}) => (
  <>
    {steps.map((step) =>
      isResponseStep(step) ? (
        <ResponseStepCard
          key={step.uuid}
          proposal={proposal}
          step={step}
          isApplicant={isApplicant}
          refetch={refetch}
        />
      ) : (
        <EvaluatorInputsCard
          key={step.uuid}
          proposal={proposal}
          step={step}
          isApplicant={isApplicant}
        />
      ),
    )}
  </>
);
