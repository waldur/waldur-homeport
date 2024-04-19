import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { Proposal, ProposalReview } from '@waldur/proposals/types';

import { FieldReviewComments } from '../create-review/FieldReviewComments';

interface RejectionSummaryProps {
  proposal: Proposal;
  reviews?: ProposalReview[];
}

export const RejectionSummary: FC<RejectionSummaryProps> = ({ reviews }) => {
  const overallScore = useMemo(() => {
    if (!reviews?.length) return 0;
    return (
      reviews.reduce((acc, value) => acc + value.summary_score, 0) /
      reviews.length
    );
  }, [reviews]);
  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-danger">
          {translate('Proposal rejected')}
        </Card.Title>
        <div className="card-toolbar">
          <h5 className="mb-0">{translate('Overall score')}:</h5>
          <RatingStars
            rating={overallScore}
            size="medium"
            color="text-dark"
            className="ms-4 me-0"
          />
        </div>
      </Card.Header>
      <Card.Body>
        <FieldReviewComments
          reviews={reviews}
          fieldName="summary_public_comment"
          hasScore
        />
      </Card.Body>
    </Card>
  );
};
