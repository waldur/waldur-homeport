import { FC } from 'react';

import { Panel } from '@waldur/core/Panel';
import { FloatingSubmitButton } from '@waldur/form/FloatingSubmitButton';
import { TosNotification } from '@waldur/form/TosNotification';
import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { useReviewActions } from '@waldur/proposals/review/utils';
import { ProposalReview } from '@waldur/proposals/types';
import { isReviewInFinalState } from '@waldur/proposals/utils';
import { ActionButton } from '@waldur/table/ActionButton';

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
  const { reject, isRejecting } = useReviewActions(review, refetch);
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
            action={reject as any}
            title={translate('Send back')}
            variant="danger"
            className="w-100 mt-2"
            disabled={submitting}
            disabledReason={translate('Please wait...')}
            pending={isRejecting}
          />
          <TosNotification className="text-center text-gray-500 mt-2" />
        </>
      )}
    </>
  );
};
