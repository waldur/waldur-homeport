import { ClipboardTextIcon, EyeIcon } from '@phosphor-icons/react';
import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { BaseButton, PropertyItem, PropertyList } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { EndingField } from '@/proposals/EndingField';
// This card renders in the submission form, the read-only detail view and the
// call-manager view alike, so the gate is the deployment's presentation
// policy, never which page it happens to be mounted in.
import { showsCallContext } from '@/proposals/presentation';
import {
  ProjectDurationNote,
  useProjectDuration,
} from '@/proposals/ProjectDurationNote';
import { isOpenEnded } from '@/proposals/roundCutoff';
import { Proposal } from '@/proposals/types';
import { VStepperFormStepCard, VStepperFormStepProps } from '@/wizard';

import { isReviewStep } from '../reviewStage';

const ProposalDetailsDialog = lazyComponent(() =>
  import('../ProposalDetailsDialog').then((module) => ({
    default: module.ProposalDetailsDialog,
  })),
);

const ProposalReviewsDialog = lazyComponent(() =>
  import('../ProposalReviewsDialog').then((module) => ({
    default: module.ProposalReviewsDialog,
  })),
);

const DetailsOverviewButton = ({ proposal, reviews, workflowStates }) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() =>
        openDialog(ProposalDetailsDialog, {
          proposal,
          reviews,
          workflowStates,
          size: 'lg',
        })
      }
      label={translate('More details')}
      iconNode={<EyeIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};

const ReviewsButton = ({ proposal, workflowStates, forApplicant }) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() =>
        // Wide enough for an expanded review, and anchored to the top so it
        // grows downwards as reviews load and expand instead of jumping.
        openDialog(ProposalReviewsDialog, {
          proposal,
          workflowStates,
          forApplicant,
          size: 'xl',
          centered: false,
        })
      }
      label={translate('Reviews')}
      iconNode={<ClipboardTextIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};

export const ProposalDetailsOverviewStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  // Only surfaced where reviews are relevant (call-manager proposal view); the
  // backend also scopes review visibility.
  const canViewReviews: boolean = props.params.canViewReviews;
  // The applicant team, once the call shares reviews with them.
  const applicantReadsReviews: boolean = props.params.applicantReadsReviews;
  // Offered where the call's workflow has a step for reviews, or the
  // proposal holds reviews all the same: assigned by hand, or written before
  // the call's workflow changed. Hidden, they could be reached from nowhere.
  const workflowStates: ProposalWorkflowStepInstance[] | undefined =
    props.params.workflowStates;
  const hasReviewStep =
    (workflowStates?.some(isReviewStep) ?? false) ||
    props.params.reviews?.length > 0;
  const projectDuration = useProjectDuration(proposal);
  return (
    <VStepperFormStepCard
      id={props.id}
      title={translate('Details overview')}
      actions={
        <div className="flex gap-1.5">
          {((canViewReviews && hasReviewStep) || applicantReadsReviews) && (
            <ReviewsButton
              proposal={proposal}
              workflowStates={workflowStates}
              forApplicant={applicantReadsReviews && !canViewReviews}
            />
          )}
          {/* Without call context the dialog holds only review tabs; with no
              reviews either it opens empty, so don't offer it. */}
          {(showsCallContext() || props.params.reviews?.length > 0) && (
            <DetailsOverviewButton
              proposal={proposal}
              reviews={props.params.reviews}
              workflowStates={workflowStates}
            />
          )}
        </div>
      }
    >
      <PropertyList
        variant="summary"
        termWidth="md"
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 text-sm"
      >
        {showsCallContext() && (
          <PropertyItem
            label={translate('Call name')}
            value={proposal.call_name}
          />
        )}
        <PropertyItem
          label={
            showsCallContext()
              ? translate('Round deadline')
              : translate('Submission closes')
          }
          value={
            <EndingField
              endDate={proposal.round?.cutoff_time}
              openEnded={isOpenEnded(proposal.round)}
              dateFirst
            />
          }
        />
        {showsCallContext() && (
          <PropertyItem
            label={translate('Round reference')}
            value={proposal.round?.name}
            hideIfEmpty={false}
          />
        )}
        {projectDuration && (
          <ProjectDurationNote
            duration={projectDuration}
            chosen={Boolean(proposal.requested_duration_months)}
          />
        )}
        {/* The applicant's name is withheld from evaluators when the call
            conceals it; leave the row out rather than show an empty cell. */}
        {proposal.created_by_name && (
          <PropertyItem
            label={translate('Created by')}
            value={proposal.created_by_name}
          />
        )}
      </PropertyList>
    </VStepperFormStepCard>
  );
};
