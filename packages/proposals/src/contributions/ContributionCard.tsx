import {
  ArrowUUpLeftIcon,
  CheckIcon,
  PaperPlaneTiltIcon,
  ShareFatIcon,
  XIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';
import {
  ProposalWorkflowStepInstance,
  StepContribution,
} from 'waldur-js-client';
import {
  AlertItem,
  AppLink,
  Badge,
  BaseButton,
  ModalService,
  Tooltip,
} from 'waldur-ui';

import { contributionStatusHint, contributionStatusLabel } from '../outcomes';
import { ProposalRef } from '../types';

import { ContributionOutcomeBadge } from './ContributionOutcomeBadge';
import { DelegateContributionDialog } from './DelegateContributionDialog';
import { SubmitContributionDialog } from './SubmitContributionDialog';
import { useContributionActions } from './useContributionActions';

const OPEN_STATUSES = ['pending', 'accepted'];

const STATUS_VARIANTS: Record<string, 'neutral' | 'info' | 'success'> = {
  pending: 'neutral',
  accepted: 'info',
  submitted: 'success',
};

/** The card's title: the offering a per-offering slot assesses, else its person. */
export const contributionTitle = (contribution: StepContribution): string =>
  (contribution.is_per_offering
    ? contribution.offering_name
    : contribution.contributor_full_name) || translate('Contribution');

/** Who holds a handed-on contribution, as its contributor reads it. */
export const delegationLine = (
  contribution: StepContribution,
): string | null => {
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

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export interface ContributionCardProps {
  proposal: ProposalRef;
  step: ProposalWorkflowStepInstance;
  contribution: StepContribution;
  /** The uuid of the signed-in user, who is not offered as a hand-on target. */
  currentUserUuid?: string;
  /** Where the step's form is filled in, when this app does not show it.
   * The submission is refused until its required answers are in. */
  formHref?: string;
  /** Shown under the header: what the proposal asks of the offering, say. */
  children?: ReactNode;
  refetch?(): void;
}

/**
 * One contribution to a step, with what its holder can do on it: submit it,
 * hand it on or take it back, accept or decline it when it was handed over.
 * Whether each is allowed comes from the backend (`can_fill`,
 * `can_delegate`, `can_accept`), which decides again on every request.
 */
export const ContributionCard: FC<ContributionCardProps> = ({
  proposal,
  step,
  contribution,
  currentUserUuid,
  formHref,
  children,
  refetch,
}) => {
  const { accept, decline, takeBack } = useContributionActions(
    proposal,
    contribution,
    refetch,
  );
  const title = contributionTitle(contribution);
  const stepActive = step.status === 'active';
  const isOpen = OPEN_STATUSES.includes(contribution.status);
  const fillable = contribution.can_fill && isOpen && stepActive;
  const canDelegate = contribution.can_delegate;
  const delegation = delegationLine(contribution);
  const hasForm = Boolean(step.checklist_status?.has_checklist);
  const unanswered = contribution.unanswered_required_count ?? 0;
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

  return (
    <div
      className="flex flex-col gap-2.5 rounded-lg border border-secondary p-4"
      data-testid="contribution-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div>
          <div className="mb-1 font-semibold">{title}</div>
          <div className="text-xs text-quaternary">
            {contribution.submitted_at
              ? translate('Submitted {date}', {
                  date: formatDate(contribution.submitted_at),
                })
              : contribution.due_at
                ? translate('Due {date}', {
                    date: formatDate(contribution.due_at),
                  })
                : null}
          </div>
          {delegation ? (
            <div className="text-xs text-quaternary">{delegation}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          {contribution.outcome ? (
            <ContributionOutcomeBadge outcome={contribution.outcome} />
          ) : null}
          {statusHint ? (
            <Tooltip label={statusHint}>{statusBadge}</Tooltip>
          ) : (
            statusBadge
          )}
        </div>
      </div>

      {children}

      {fillable ? (
        <div className="flex flex-col gap-1.5 rounded-lg bg-secondary p-3">
          <div className="font-semibold">
            {translate('What is asked of you')}
          </div>
          <p className="mb-0 whitespace-pre-line text-secondary">
            {step.step_description ||
              (contribution.is_per_offering && contribution.offering_name
                ? translate(
                    'Assess whether this proposal can be served by {offering}.',
                    { offering: contribution.offering_name },
                  )
                : translate('Give your assessment of this proposal.'))}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-quaternary">
              {hasForm
                ? translate('Fill in the form, then submit one of:')
                : translate('Submit one of:')}
            </span>
            {(step.contribution_outcomes ?? []).map((outcome) => (
              <ContributionOutcomeBadge key={outcome} outcome={outcome} />
            ))}
          </div>
        </div>
      ) : null}

      {fillable && hasForm && unanswered > 0 ? (
        <AlertItem
          variant="warning"
          title={translate(
            '{count} required questions of the form are unanswered',
            { count: unanswered },
          )}
          body={
            formHref ? (
              <AppLink to={formHref} className="text-brand hover:underline">
                {translate('Fill in the form')}
              </AppLink>
            ) : undefined
          }
        />
      ) : null}

      {contribution.conditions ? (
        <div>
          <div className="font-semibold">{translate('Conditions')}</div>
          <p className="mb-0 whitespace-pre-line">{contribution.conditions}</p>
        </div>
      ) : null}
      {contribution.comment ? (
        <p className="mb-0 whitespace-pre-line text-secondary">
          {contribution.comment}
        </p>
      ) : null}

      {contribution.can_accept || canDelegate || fillable ? (
        <div className="flex flex-wrap justify-end gap-2.5">
          {contribution.can_accept ? (
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
          ) : null}
          {canDelegate && contribution.delegate_uuid ? (
            <BaseButton
              variant="tertiary"
              label={translate('Take back')}
              iconNode={<ArrowUUpLeftIcon weight="bold" />}
              onClick={() => takeBack.mutate()}
            />
          ) : null}
          {canDelegate ? (
            <BaseButton
              variant="tertiary"
              label={translate('Hand on')}
              iconNode={<ShareFatIcon weight="bold" />}
              onClick={() =>
                ModalService.open(DelegateContributionDialog, {
                  resolve: {
                    proposal,
                    contribution,
                    title,
                    currentUserUuid,
                    refetch,
                  },
                })
              }
            />
          ) : null}
          {fillable ? (
            <BaseButton
              variant="primary"
              label={translate('Submit contribution')}
              iconNode={<PaperPlaneTiltIcon weight="bold" />}
              onClick={() =>
                ModalService.open(SubmitContributionDialog, {
                  resolve: { proposal, step, contribution, title, refetch },
                })
              }
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
