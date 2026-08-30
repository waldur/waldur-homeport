import { FC } from 'react';
import { proposalReviewsReject } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { formatJsxTemplate, translate } from '@/i18n';
import { PageBarTabs } from '@/marketplace/common/PageBarTabs';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useCallFixedDuration } from '@/proposals/callQueries';
import { ProposalCostTotal } from '@/proposals/ProposalCostTotal';
import { Proposal, ProposalReview } from '@/proposals/types';
import { useProposalResourceRows } from '@/proposals/useProposalResourceRows';
import { isReviewInFinalState } from '@/proposals/utils';
import { ActionButton } from '@/table/ActionButton';

import { createReviewSteps } from './steps/steps';
import { SubmitReviewDialog } from './SubmitReviewDialog';

const tabs = createReviewSteps.map((step) => ({
  key: step.id,
  title: step.label,
}));

interface CreatePageSidebarProps {
  review: ProposalReview;
  /** Whose requests the summary totals. */
  proposal: Proposal;
  refetch?(): void;
}

export const CreatePageSidebar: FC<CreatePageSidebarProps> = ({
  review,
  proposal,
  refetch,
}) => {
  const { openDialog } = useModal();
  // The applicant sees this total beside their own form; a reviewer weighing
  // the proposal needs the same figure, and the steps below only show the
  // per-row costs.
  const { data: resourceRows } = useProposalResourceRows(proposal?.uuid);
  const fixedDurationDays = useCallFixedDuration(proposal?.call_uuid);

  const rejectMutation = useManagedMutation<any, any, void>({
    mutationFn: () => proposalReviewsReject({ path: { uuid: review.uuid } }),
    successMessage: translate('Review has been rejected.'),
    errorMessage: translate('Unable to reject review.'),
    refetch,
    confirmation: {
      title: translate('Reject review'),
      body: review
        ? translate(
            'Are you sure you want to reject the {name} proposal review?',
            {
              name: <b>{review.proposal_name}</b>,
            },
            formatJsxTemplate,
          )
        : undefined,
    },
  });
  return (
    <>
      <Panel title={translate('Progress')} cardBordered className="mb-5">
        <PageBarTabs tabs={tabs} mode="tabs-left" />
      </Panel>
      <ProposalCostTotal
        rows={resourceRows || []}
        fixedDurationDays={fixedDurationDays}
        panel
      />
      {review && !isReviewInFinalState(review.state) && (
        <>
          <ActionButton
            action={() =>
              openDialog(SubmitReviewDialog, { resolve: { review, refetch } })
            }
            title={translate('Submit review')}
            variant="primary"
            className="w-100 mt-2"
          />
          <ActionButton
            action={() => rejectMutation.mutate()}
            title={translate('Send back')}
            variant="danger"
            className="w-100 mt-2"
            pending={rejectMutation.isPending}
          />
        </>
      )}
    </>
  );
};
