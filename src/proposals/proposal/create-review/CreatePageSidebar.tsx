import { FC } from 'react';
import { proposalReviewsReject } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { formatJsxTemplate, translate } from '@/i18n';
import { PageBarTabs } from '@/marketplace/common/PageBarTabs';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ProposalReview } from '@/proposals/types';
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
  refetch?(): void;
}

export const CreatePageSidebar: FC<CreatePageSidebarProps> = ({
  review,
  refetch,
}) => {
  const { openDialog } = useModal();

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
