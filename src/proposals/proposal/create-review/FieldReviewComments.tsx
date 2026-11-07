import classNames from 'classnames';

import { SPACE_CLASSES, Space } from 'waldur-form';

import { formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ProposalReview } from '@/proposals/types';

import { ReviewComment } from './ReviewComment';

import './FieldReviewComments.scss';

interface FieldReviewCommentsProps {
  fieldName: string;
  reviews: ProposalReview[];
  hasScore?: boolean;
  space?: Space;
  className?: string;
  /** Below a table, about all of it. */
  nested?: boolean;
}

export const FieldReviewComments = ({
  reviews,
  fieldName,
  hasScore,
  space = 5.5,
  className,
  nested,
}: FieldReviewCommentsProps) => {
  if (!reviews) return null;
  const items = reviews
    .filter(Boolean)
    .map((review) => ({
      reviewer: review.reviewer_full_name || review.anonymous_reviewer_name,
      image: review.reviewer_image,
      comment: review[fieldName],
      score: hasScore ? review.summary_score : undefined,
      time: review.modified ? formatRelative(review.modified) : null,
    }))
    .filter((item) => item.comment || item.score !== undefined);

  if (!items?.length) return null;

  if (nested) {
    // A part of the section of its own, headed as the evaluator roles are.
    return (
      <section className={classNames('mb-' + space, className)}>
        <h4 className="text-sm font-medium mb-1.5">
          {translate('Reviewer comments')}
        </h4>
        {items.map((item, i) => (
          <ReviewComment
            key={i}
            title={item.reviewer}
            score={item.score}
            time={item.time}
            nested
            className={i < items.length - 1 ? 'mb-3' : undefined}
          >
            {item.comment}
          </ReviewComment>
        ))}
      </section>
    );
  }

  return (
    <div
      className={classNames(
        'review-comments-list',
        SPACE_CLASSES[space],
        className,
      )}
    >
      {items.map((item, i) => (
        <ReviewComment
          key={i}
          title={item.reviewer}
          image={item.image}
          score={item.score}
          time={item.time}
        >
          {item.comment}
        </ReviewComment>
      ))}
    </div>
  );
};
