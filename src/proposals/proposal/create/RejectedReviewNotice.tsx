import { FC } from 'react';
import { ProposalReview } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

/**
 * The review a reviewer followed a link to, when it is their own and has been
 * rejected. Rejecting the review withdraws the access it gave, so a link from
 * "My reviews" or a notification otherwise lands on a bare "not found", or on
 * a proposal page that says nothing of the review having gone.
 */
export const getRejectedOwnReview = (
  reviews: ProposalReview[] | null | undefined,
  reviewUuid: string | undefined,
  user: { uuid?: string } | null | undefined,
): ProposalReview | null => {
  if (!reviewUuid || !user?.uuid) return null;
  const review = reviews?.find((rw) => rw.uuid === reviewUuid);
  if (!review || review.state !== 'rejected') return null;
  return review.reviewer_uuid === user.uuid ? review : null;
};

/**
 * The viewer's own most recent rejected review among ``reviews``: what
 * explains a proposal they reviewed and can no longer open, when they come
 * by the proposal's own link rather than their review's.
 */
export const getLatestRejectedOwnReview = (
  reviews: ProposalReview[] | null | undefined,
  user: { uuid?: string } | null | undefined,
): ProposalReview | null => {
  if (!user?.uuid) return null;
  const own = (reviews ?? []).filter(
    (review) =>
      review.state === 'rejected' && review.reviewer_uuid === user.uuid,
  );
  if (!own.length) return null;
  return own.reduce((latest, review) =>
    new Date(review.modified) > new Date(latest.modified) ? review : latest,
  );
};

interface RejectedReviewNoticeProps {
  review: Pick<ProposalReview, 'modified'>;
  /** Whether the reviewer can still read the proposal some other way. */
  hasAccess: boolean;
  className?: string;
}

export const RejectedReviewNotice: FC<RejectedReviewNoticeProps> = ({
  review,
  hasAccess,
  className,
}) => {
  // The review keeps no timestamp of its own for the rejection; its last
  // change is the closest record of that moment.
  const date = formatDate(review.modified);
  return (
    <AlertItem
      type="floating"
      variant="warning"
      className={className}
      title={
        hasAccess
          ? translate('This review was rejected on {date}.', { date })
          : translate(
              'This review was rejected on {date}; you no longer have access to this proposal.',
              { date },
            )
      }
    />
  );
};
