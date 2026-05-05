import { FC, useMemo } from 'react';
import { FormLabel } from 'react-bootstrap';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ProposalReview } from '@/proposals/types';

import { FieldReviewComments } from '../create-review/FieldReviewComments';
import { RateStars } from '../create-review/RateStars';

interface ProposalReviewDialogProps {
  reviews: ProposalReview[];
}

export const ProposalReviewDialog: FC<ProposalReviewDialogProps> = ({
  reviews,
}) => {
  const overallScore = useMemo(() => {
    if (!reviews?.length) return 0;
    return (
      reviews.reduce((acc, value) => acc + value.summary_score, 0) /
      reviews.length
    );
  }, [reviews]);

  return (
    <ModalDialog title={translate('Proposal review details')}>
      <FormLabel className="mb-0">{translate('Rate')}</FormLabel>
      <div className="d-flex align-items-center flex-grow-1 flex-wrap gap-4">
        <RateStars value={overallScore} className="mb-4" />
        <span className="fs-6 text-gray-700">
          {overallScore === 1
            ? translate('1 star')
            : translate('{count} stars', { count: overallScore })}
        </span>
      </div>

      <FormLabel>{translate('Comments')}</FormLabel>
      <FieldReviewComments
        reviews={reviews}
        fieldName="summary_public_comment"
        hasScore
        space={0}
      />
    </ModalDialog>
  );
};
