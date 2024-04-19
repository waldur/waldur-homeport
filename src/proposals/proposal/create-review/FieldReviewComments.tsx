import { translate } from '@waldur/i18n';
import { ProposalReview } from '@waldur/proposals/types';

import { ReviewComment } from './ReviewComment';

interface FieldReviewCommentsProps {
  fieldName: string;
  reviews: ProposalReview[];
  hasScore?: boolean;
}

export const FieldReviewComments = ({
  reviews,
  fieldName,
  hasScore,
}: FieldReviewCommentsProps) => {
  if (!reviews) return null;
  const items = reviews
    .filter(Boolean)
    .map((review, i) => ({
      reviewer: translate('From reviewer {number}', { number: i + 1 }),
      comment: review[fieldName],
      score: hasScore ? review.summary_score : undefined,
    }))
    .filter((item) => item.comment || item.score !== undefined);
  return (
    <>
      {items.map((item, i) => (
        <ReviewComment
          key={i}
          title={item.reviewer}
          score={item.score}
          className="mb-7"
        >
          {item.comment}
        </ReviewComment>
      ))}
    </>
  );
};
