import classNames from 'classnames';

import { formatRelative } from '@waldur/core/dateUtils';
import { ProposalReview } from '@waldur/proposals/types';

import { ReviewComment } from './ReviewComment';

import './FieldReviewComments.scss';

interface FieldReviewCommentsProps {
  fieldName: string;
  reviews: ProposalReview[];
  hasScore?: boolean;
  space?: number;
  className?: string;
}

export const FieldReviewComments = ({
  reviews,
  fieldName,
  hasScore,
  space = 7,
  className,
}: FieldReviewCommentsProps) => {
  if (!reviews) return null;
  const items = reviews
    .filter(Boolean)
    .map((review) => ({
      reviewer: review.reviewer_full_name || review.anonymous_reviewer_name,
      comment: review[fieldName],
      score: hasScore ? review.summary_score : undefined,
      time: review.review_end_date
        ? formatRelative(review.review_end_date)
        : null,
    }))
    .filter((item) => item.comment || item.score !== undefined);

  if (!items?.length) return null;

  return (
    <div
      className={classNames('review-comments-list', 'mb-' + space, className)}
    >
      {items.map((item, i) => (
        <ReviewComment
          key={i}
          title={item.reviewer}
          score={item.score}
          time={item.time}
        >
          {item.comment}
        </ReviewComment>
      ))}
    </div>
  );
};
