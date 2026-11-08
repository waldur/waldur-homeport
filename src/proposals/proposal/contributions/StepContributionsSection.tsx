import {
  ArrowCounterClockwiseIcon,
  ArrowUUpLeftIcon,
  CheckIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
  ShareFatIcon,
  XIcon,
} from '@phosphor-icons/react';
import { FC, useMemo, useState } from 'react';
import {
  ProposalChangeRequest,
  proposalProposalsAcceptContribution,
  proposalProposalsDeclineContribution,
  proposalProposalsDelegateContribution,
  proposalProposalsReopenContribution,
  ProposalWorkflowStepInstance,
  RequestedResource,
  StepContribution,
  StepContributionWithAnswers,
} from 'waldur-js-client';

import {
  AccordionCard,
  AlertItem,
  Badge,
  BaseButton,
  Tooltip,
} from 'waldur-ui';

import { formatDate, formatRelative } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { CoiDeclaration } from '@/proposals/coi-declaration/CoiDeclaration';
import { getRequestedLines } from '@/proposals/provider-calls/requestedLines';
import { isOnProposalTeam } from '@/proposals/team/teamRules';
import { Proposal } from '@/proposals/types';
import { useProposalResourceRows } from '@/proposals/useProposalResourceRows';
import {
  contributionStatusHint,
  contributionStatusLabel,
} from '@/proposals/workflow/constants';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';
import { stageStillOpen } from '@/proposals/workflow/stages';
import { useUser } from '@/workspace/hooks';

import { isResponseStep } from '../inputs/queries';
import { sectionOpenProps, useSectionOpenState } from '../sectionOpen';
import { StepChecklistSection } from '../StepChecklistSection';

import { actsAsOutsider, ContributionActLock } from './ContributionActLock';
import { ContributionOutcomeBadge } from './ContributionOutcomeBadge';
import {
  proposalContributionsKey,
  useContributionReopenings,
  useProposalContributions,
  useStepContributionAnswers,
} from './queries';

const SubmitContributionDialog = lazyComponent(() =>
  import('./SubmitContributionDialog').then((module) => ({
    default: module.SubmitContributionDialog,
  })),
);

const DelegateContributionDialog = lazyComponent(() =>
  import('./DelegateContributionDialog').then((module) => ({
    default: module.DelegateContributionDialog,
  })),
);

const OPEN_STATUSES = ['pending', 'accepted'];

/**
 * Who the slot is handed to, as the viewer may know it: awaiting their
 * answer while pending.
 */
const delegationLine = (contribution: StepContribution): string | null => {
  if (!contribution.delegate_full_name) return null;
  if (contribution.can_accept) {
    return translate('Handed to you; accept it to fill it in.');
  }
  return contribution.status === 'pending'
    ? translate('Handed to {name}, awaiting their answer', {
        name: contribution.delegate_full_name,
      })
    : translate('Handed to {name}', {
        name: contribution.delegate_full_name,
      });
};

/** Accepting, declining and taking back a handed-on slot, in place. */
const useDelegationActions = (
  proposal: Proposal,
  contribution: StepContribution,
  refetch?: () => void,
) => {
  const invalidateQueries = [
    { queryKey: proposalContributionsKey(proposal.uuid) },
    { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
  ];
  const path = { uuid: proposal.uuid };
  const accept = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsAcceptContribution({
        path,
        body: {
          contribution_uuid: contribution.uuid,
          confirm_no_conflict: true,
        },
      }),
    confirmation: {
      title: translate('Accept the contribution'),
      body: contribution.coi_declaration_text ? (
        <>
          <p>{translate('You take this contribution over and fill it in.')}</p>
          <CoiDeclaration
            text={contribution.coi_declaration_text}
            fallback={null}
          />
        </>
      ) : (
        translate(
          'You take this contribution over and fill it in. You confirm that you have no conflict of interest with the proposal.',
        )
      ),
    },
    successMessage: translate('The contribution is yours to fill in.'),
    errorMessage: translate('Unable to accept the contribution.'),
    closeModal: false,
    refetch,
    invalidateQueries,
  });
  const decline = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsDeclineContribution({
        path,
        body: { contribution_uuid: contribution.uuid },
      }),
    confirmation: {
      title: translate('Decline the contribution'),
      body: translate(
        'The contribution goes back to whoever handed it to you, who is told.',
      ),
    },
    successMessage: translate('The contribution is handed back.'),
    errorMessage: translate('Unable to decline the contribution.'),
    closeModal: false,
    refetch,
    invalidateQueries,
  });
  const takeBack = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsDelegateContribution({
        path,
        body: { contribution_uuid: contribution.uuid, user_uuid: null },
      }),
    confirmation: {
      title: translate('Take the contribution back'),
      body: translate(
        'The person it is handed to can no longer fill it in, and is told. What they wrote stays.',
      ),
    },
    successMessage: translate('The contribution is taken back.'),
    errorMessage: translate('Unable to take the contribution back.'),
    closeModal: false,
    refetch,
    invalidateQueries,
  });
  return { accept, decline, takeBack };
};

/** The card's title: the offering a per-offering slot assesses, else its person. */
const contributionTitle = (contribution: StepContribution): string =>
  (contribution.is_per_offering
    ? contribution.offering_name
    : contribution.contributor_full_name) || translate('Contribution');

const STATUS_VARIANTS: Record<string, 'neutral' | 'info' | 'success'> = {
  pending: 'neutral',
  accepted: 'info',
  submitted: 'success',
};

interface ContributionCardProps {
  proposal: Proposal;
  step: ProposalWorkflowStepInstance;
  contribution: StepContribution;
  answers?: StepContributionWithAnswers;
  /** The open request to revise it, when it was reopened. */
  reopening?: ProposalChangeRequest;
  /** The proposal's steps, to tell whether it still stands in this one's stage. */
  workflowStates?: ProposalWorkflowStepInstance[];
  /** What the proposal asks of the contribution's offering, when it is one
   *  offering's to make. */
  requested?: RequestedResource[];
  refetch?(): void;
}

/** What the proposal asks of the offering, one line per component. */
const RequestedFromOffering: FC<{
  offeringName: string;
  requested: RequestedResource[];
}> = ({ offeringName, requested }) => {
  const lines = requested.flatMap((row) =>
    getRequestedLines(
      row.limits as Record<string, number>,
      row.requested_offering?.components,
    ),
  );
  if (!lines.length) {
    return null;
  }
  return (
    <div data-testid="contribution-requested">
      <div className="font-semibold">
        {translate('Requested from {offering}', { offering: offeringName })}
      </div>
      <ul className="list-unstyled mb-0">
        {lines.map((line, i) => (
          <li key={`${line.key}-${i}`}>
            <span className="text-quaternary">{line.label}: </span>
            {[formatUsageValue(line.amount), line.unit]
              .filter(Boolean)
              .join(' ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * What the one who fills the contribution is asked to do: the step's own
 * description of the work (or, without one, a plain line for it), then
 * answering the step's form where it has one and submitting an outcome.
 */
const ContributionGuidance: FC<{
  step: ProposalWorkflowStepInstance;
  contribution: StepContribution;
  hasForm: boolean;
}> = ({ step, contribution, hasForm }) => {
  const outcomes = step.contribution_outcomes ?? [];
  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg bg-secondary p-3"
      data-testid="contribution-guidance"
    >
      <div className="font-semibold">{translate('What is asked of you')}</div>
      <p className="mb-0 text-secondary whitespace-pre-line">
        {step.step_description ||
          (contribution.is_per_offering && contribution.offering_name
            ? translate(
                'Assess whether this proposal can be served by {offering}.',
                { offering: contribution.offering_name },
              )
            : translate('Give your assessment of this proposal.'))}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-quaternary text-xs">
          {hasForm
            ? translate('Fill in the form, then submit one of:')
            : translate('Submit one of:')}
        </span>
        {outcomes.map((outcome) => (
          <ContributionOutcomeBadge key={outcome} outcome={outcome} />
        ))}
      </div>
    </div>
  );
};

/**
 * Whether the viewer may reopen a submitted contribution: the call's managers
 * and organisers, never from the applicant team, while its step runs or the
 * proposal has not left its stage. The backend decides again.
 */
const useCanReopen = (
  proposal: Proposal,
  step: ProposalWorkflowStepInstance,
  contribution: StepContribution,
  workflowStates: ProposalWorkflowStepInstance[] | undefined,
) => {
  const user = useUser();
  if (contribution.status !== 'submitted' || contribution.review_uuid) {
    return false;
  }
  const stepOpen =
    step.status === 'active' ||
    (step.status === 'completed' &&
      stageStillOpen(
        step,
        workflowStates ?? [step],
        !!proposal.awaiting_manual_advance,
        proposal.workflow_step,
      ));
  if (!stepOpen || proposal.state !== 'in_review') return false;
  if (user?.is_staff) return true;
  if (isOnProposalTeam(user, proposal)) return false;
  return Boolean(
    hasPermission(user, {
      permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    }),
  );
};

const ContributionCard: FC<ContributionCardProps> = ({
  proposal,
  step,
  contribution,
  answers,
  reopening,
  workflowStates,
  requested,
  refetch,
}) => {
  const { openDialog } = useModal();
  const canReopen = useCanReopen(proposal, step, contribution, workflowStates);
  const reopen = useManagedMutation<any, any, { input: string }>({
    mutationFn: (variables) =>
      proposalProposalsReopenContribution({
        path: { uuid: proposal.uuid },
        body: {
          contribution_uuid: contribution.uuid,
          message: variables.input,
        },
      }),
    refetch,
    confirmation: {
      title: translate('Request changes'),
      body: translate(
        'Reopen this contribution for its contributor to revise and submit again? Its answers are kept; its outcome counts again once resubmitted. The applicant is not told.',
      ),
      options: {
        showInput: true,
        inputLabel: translate('Message to the contributor'),
        inputPlaceholder: translate('What should be revised'),
        inputRequired: true,
      },
    },
    successMessage: translate('The contribution has been reopened.'),
    errorMessage: translate('Unable to reopen the contribution.'),
    invalidateQueries: [
      { queryKey: proposalContributionsKey(proposal.uuid) },
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
    ],
  });
  const [editing, setEditing] = useState(false);
  // Off the slot's team -- a call manager, staff -- its own actions stay
  // locked until unlocked on purpose, as the applicant's form does.
  const viewer = useUser();
  const outsider = actsAsOutsider(viewer, contribution);
  const [unlocked, setUnlocked] = useState(false);
  const locked = outsider && !unlocked;
  const canDelegate = contribution.can_delegate && !locked;
  const { accept, decline, takeBack } = useDelegationActions(
    proposal,
    contribution,
    refetch,
  );
  const delegation = delegationLine(contribution);
  const title = contributionTitle(contribution);
  const isOpen = OPEN_STATUSES.includes(contribution.status);
  const stepActive = step.status === 'active';
  const fillable = contribution.can_fill && isOpen && stepActive && !locked;
  const statusHint = contributionStatusHint(contribution.status, stepActive);
  const statusBadge = (
    <Badge
      variant={STATUS_VARIANTS[contribution.status] ?? 'neutral'}
      shape="pill"
      tone="outline"
    >
      {contributionStatusLabel(contribution.status, stepActive)}
    </Badge>
  );
  const hasForm = Boolean(step.checklist_status?.has_checklist);
  // Submitting closes the form: what was answered is shown read-only.
  const showForm = editing && hasForm && fillable;
  const shownAnswers = (answers?.answers ?? []).filter(
    (answer) => answer.answer_display,
  );

  return (
    <div
      className="border border-secondary rounded-lg p-4 flex flex-col gap-2.5"
      data-testid="step-contribution"
    >
      <div className="flex flex-wrap justify-between items-start gap-2.5">
        <div>
          <h5 className="mb-1">{title}</h5>
          <div className="text-quaternary text-xs">
            {/* Who submitted is named only to those who may know it; the
                applicant is told no more than when. */}
            {contribution.is_per_offering &&
            contribution.contributor_uuid &&
            contribution.contributor_full_name
              ? translate('Submitted by {name}', {
                  name: contribution.contributor_full_name,
                })
              : contribution.submitted_at
                ? translate('Submitted {time}', {
                    time: formatRelative(contribution.submitted_at),
                  })
                : contribution.due_at
                  ? translate('Due {date}', {
                      date: formatDate(contribution.due_at),
                    })
                  : null}
          </div>
          {delegation && (
            <div
              className="text-quaternary text-xs"
              data-testid="contribution-delegate"
            >
              {delegation}
            </div>
          )}
        </div>
        <div className="flex gap-1.5 items-center">
          {contribution.outcome && (
            <ContributionOutcomeBadge outcome={contribution.outcome} />
          )}
          {statusHint ? (
            <Tooltip label={statusHint}>{statusBadge}</Tooltip>
          ) : (
            statusBadge
          )}
        </div>
      </div>

      {requested?.length ? (
        <RequestedFromOffering
          offeringName={contribution.offering_name || title}
          requested={requested}
        />
      ) : null}

      {fillable && (
        <ContributionGuidance
          step={step}
          contribution={contribution}
          hasForm={hasForm}
        />
      )}

      {reopening && (
        <AlertItem
          variant="warning"
          title={translate('Reopened for changes')}
          body={
            <span className="whitespace-pre-line">{reopening.message}</span>
          }
          data-testid="contribution-reopened"
        />
      )}

      {contribution.conditions && (
        <div>
          <div className="font-semibold">{translate('Conditions')}</div>
          <p className="mb-0 whitespace-pre-line">{contribution.conditions}</p>
        </div>
      )}
      {contribution.comment && (
        <p className="mb-0 text-secondary whitespace-pre-line">
          {contribution.comment}
        </p>
      )}

      {!showForm && shownAnswers.length > 0 && (
        <dl className="mb-0">
          {shownAnswers.map((answer) => (
            <div key={answer.question_uuid} className="mb-1.5">
              <dt className="font-semibold">{answer.question_description}</dt>
              <dd className="mb-0 whitespace-pre-line">
                {answer.answer_display}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {showForm && (
        <StepChecklistSection
          proposal={proposal}
          step={step}
          canEdit={fillable}
          contributionUuid={contribution.uuid}
          embedded
        />
      )}

      {outsider &&
        ((contribution.can_fill && isOpen && stepActive) ||
          contribution.can_delegate) && (
          <ContributionActLock
            contribution={contribution}
            unlocked={unlocked}
            onChange={setUnlocked}
          />
        )}

      {(contribution.can_accept || canDelegate) && (
        <div className="flex justify-end gap-2.5">
          {contribution.can_accept && (
            <>
              <BaseButton
                variant="tertiary"
                label={translate('Decline')}
                iconNode={<XIcon weight="bold" />}
                onClick={() => decline.mutate()}
              />
              <BaseButton
                variant="primary"
                label={translate('Accept')}
                iconNode={<CheckIcon weight="bold" />}
                onClick={() => accept.mutate()}
              />
            </>
          )}
          {canDelegate && contribution.delegate_uuid && (
            <BaseButton
              variant="tertiary"
              label={translate('Take back')}
              iconNode={<ArrowUUpLeftIcon weight="bold" />}
              onClick={() => takeBack.mutate()}
            />
          )}
          {canDelegate && (
            <BaseButton
              variant="tertiary"
              label={translate('Hand on')}
              iconNode={<ShareFatIcon weight="bold" />}
              onClick={() =>
                openDialog(DelegateContributionDialog, {
                  resolve: { proposal, contribution, title, refetch },
                })
              }
            />
          )}
        </div>
      )}

      {canReopen && (
        <div className="flex justify-end">
          <BaseButton
            variant="tertiary"
            label={translate('Request changes')}
            iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
            onClick={() => reopen.mutate()}
            pending={reopen.isPending}
            data-testid="reopen-contribution"
          />
        </div>
      )}

      {fillable && (
        <div className="flex justify-end gap-2.5">
          {hasForm && (
            <BaseButton
              variant="tertiary"
              label={
                editing ? translate('Close form') : translate('Fill in form')
              }
              iconNode={<PencilSimpleIcon weight="bold" />}
              onClick={() => setEditing(!editing)}
            />
          )}
          <BaseButton
            variant="primary"
            label={translate('Submit contribution')}
            iconNode={<PaperPlaneTiltIcon weight="bold" />}
            onClick={() =>
              openDialog(SubmitContributionDialog, {
                resolve: { proposal, step, contribution, title, refetch },
              })
            }
          />
        </div>
      )}
    </div>
  );
};

const StepContributions: FC<{
  proposal: Proposal;
  step: ProposalWorkflowStepInstance;
  contributions: StepContribution[];
  workflowStates?: ProposalWorkflowStepInstance[];
  refetch?(): void;
}> = ({ proposal, step, contributions, workflowStates, refetch }) => {
  const openState = useSectionOpenState();
  const hasForm = Boolean(step.checklist_status?.has_checklist);
  const { data: answers } = useStepContributionAnswers(
    proposal.uuid,
    step.call_step_uuid,
    hasForm,
  );
  const { data: reopenings } = useContributionReopenings(proposal.uuid);
  // A per-offering step shows each card what its offering was asked for.
  const { data: resourceRows } = useProposalResourceRows(
    step.per_requested_offering ? proposal.uuid : '',
  );
  const anyFillable = contributions.some(
    (contribution) =>
      contribution.can_fill &&
      OPEN_STATUSES.includes(contribution.status) &&
      step.status === 'active',
  );
  const requestedByOffering = useMemo(() => {
    const byOffering = new Map<string, RequestedResource[]>();
    for (const row of (resourceRows ?? []) as RequestedResource[]) {
      const key = row.requested_offering?.uuid;
      if (key) {
        byOffering.set(key, [...(byOffering.get(key) ?? []), row]);
      }
    }
    return byOffering;
  }, [resourceRows]);
  return (
    <AccordionCard
      id={`step-contributions-${step.call_step_uuid}`}
      title={translate('{step}: contributions', { step: step.step_name })}
      subtitle={
        step.per_requested_offering
          ? translate(
              'One contribution per requested offering, filled by its team.',
            )
          : step.contributors_lead_only
            ? translate('One contribution, written by the lead of the role.')
            : translate('One contribution per contributor.')
      }
      {...sectionOpenProps(
        openState,
        `step-contributions-${step.call_step_uuid}`,
        true,
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Whoever fills a card reads the step's description in it. */}
        {step.step_description && !anyFillable && (
          <p
            className="mb-0 text-secondary whitespace-pre-line"
            data-testid="step-description"
          >
            {step.step_description}
          </p>
        )}
        {contributions.map((contribution) => (
          <ContributionCard
            key={contribution.uuid}
            proposal={proposal}
            step={step}
            contribution={contribution}
            answers={answers?.[contribution.uuid]}
            reopening={reopenings?.[contribution.uuid]}
            workflowStates={workflowStates}
            requested={
              contribution.requested_offering_uuid
                ? requestedByOffering.get(contribution.requested_offering_uuid)
                : undefined
            }
            refetch={refetch}
          />
        ))}
      </div>
    </AccordionCard>
  );
};

/**
 * The steps with contribution cards on the proposal, in workflow order, each
 * with the contributions shown on it. A step listed nowhere here has no card.
 */
export const groupContributionsByStep = (
  contributions: StepContribution[] | undefined,
  workflowStates: ProposalWorkflowStepInstance[] | undefined,
  hiddenStepUuids?: string[],
) => {
  const activeSteps = new Set(
    (workflowStates ?? [])
      .filter((step) => step.status === 'active')
      .map((step) => step.call_step_uuid),
  );
  const byStep = new Map<string, StepContribution[]>();
  for (const contribution of (contributions ?? []).filter(
    (contribution) =>
      // A reviewer's contribution is their review, shown as such; a slot
      // taken out of the work before anything was submitted is no work --
      // except one paused on a running step, which may yet resume.
      !contribution.review_uuid &&
      !(
        ['withdrawn', 'expired', 'declined'].includes(contribution.status) &&
        !contribution.submitted_at &&
        !(
          contribution.status === 'expired' &&
          activeSteps.has(contribution.call_step_uuid)
        )
      ),
  )) {
    const list = byStep.get(contribution.call_step_uuid) ?? [];
    list.push(contribution);
    byStep.set(contribution.call_step_uuid, list);
  }
  return (workflowStates ?? [])
    .filter(
      (step) =>
        byStep.has(step.call_step_uuid) &&
        !hiddenStepUuids?.includes(step.call_step_uuid) &&
        // A response step's form is shown with what it responds to.
        !isResponseStep(step),
    )
    .map((step) => ({
      step,
      contributions: byStep.get(step.call_step_uuid),
    }));
};

interface StepContributionsSectionProps {
  proposal: Proposal;
  workflowStates: ProposalWorkflowStepInstance[] | undefined;
  /** Steps shown elsewhere on the page, as what a later step reads. */
  hiddenStepUuids?: string[];
  refetch?(): void;
}

/**
 * The work done inside the proposal's steps, one card per contribution -- per
 * requested offering or per person -- with its form, outcome and conditions.
 * A contributor fills and submits their own card here; everyone else sees
 * what the backend lets them read.
 */
export const StepContributionsSection: FC<StepContributionsSectionProps> = ({
  proposal,
  workflowStates,
  hiddenStepUuids,
  refetch,
}) => {
  const { data: contributions } = useProposalContributions(proposal.uuid);

  const groups = useMemo(
    () =>
      groupContributionsByStep(contributions, workflowStates, hiddenStepUuids),
    [contributions, workflowStates, hiddenStepUuids],
  );

  if (!groups.length) {
    return null;
  }
  return (
    <>
      {groups.map(({ step, contributions: stepContributions }) => (
        <StepContributions
          key={step.call_step_uuid}
          proposal={proposal}
          step={step}
          contributions={stepContributions}
          workflowStates={workflowStates}
          refetch={refetch}
        />
      ))}
    </>
  );
};
