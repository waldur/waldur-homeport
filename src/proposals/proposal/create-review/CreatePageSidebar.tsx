import { FC } from 'react';
import { proposalReviewsReject } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { FloatingSubmitButton } from '@/form/FloatingSubmitButton';
import { TosNotification } from '@/form/TosNotification';
import { formatJsxTemplate, translate } from '@/i18n';
import { PageBarTabs } from '@/marketplace/common/PageBarTabs';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ProposalReview } from '@/proposals/types';
import { isReviewInFinalState } from '@/proposals/utils';
import { ActionButton } from '@/table/ActionButton';

import { createReviewSteps } from './steps/steps';

const tabs = createReviewSteps.map((step) => ({
  key: step.id,
  title: step.label,
}));

interface CreatePageSidebarProps {
  review: ProposalReview;
  submitting?: boolean;
  saveAsDraft(): void;
  isSaving?: boolean;
  refetch?(): void;
}

export const CreatePageSidebar: FC<CreatePageSidebarProps> = ({
  review,
  submitting,
  saveAsDraft,
  isSaving,
  refetch,
}) => {
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
            action={saveAsDraft}
            title={translate('Save as draft')}
            variant="secondary"
            className="w-100 mt-2"
            pending={isSaving}
          />
          <hr />
          <FloatingSubmitButton
            submitting={submitting}
            label={translate('Submit review')}
            variant="primary"
          />

          <ActionButton
            action={() => rejectMutation.mutate()}
            title={translate('Send back')}
            variant="danger"
            className="w-100 mt-2"
            disabled={submitting}
            disabledReason={translate('Please wait...')}
            pending={rejectMutation.isPending}
          />
          <TosNotification className="text-center text-gray-500 mt-2" />
        </>
      )}
    </>
  );
};
