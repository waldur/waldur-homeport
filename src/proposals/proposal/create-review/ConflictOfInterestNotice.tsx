import { FC } from 'react';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ProposalReview } from '@/proposals/types';
import { isReviewInFinalState } from '@/proposals/utils';

interface ConflictOfInterestNoticeProps {
  review: ProposalReview;
}

/**
 * Says up front that this call expects a conflict-of-interest declaration.
 *
 * The attestation itself lives in the submit dialog because the backend only
 * accepts `coi_confirmed` through the submit action — which means a reviewer
 * met the question after reading the applicant's summary, team and budget,
 * i.e. after seeing everything the declaration exists to protect. Stating the
 * expectation before the proposal body at least lets a conflicted reviewer
 * stop and decline instead of reading on.
 */
export const ConflictOfInterestNotice: FC<ConflictOfInterestNoticeProps> = ({
  review,
}) => {
  if (
    !review?.coi_confirmation_required ||
    review.coi_confirmed ||
    isReviewInFinalState(review.state)
  ) {
    return null;
  }

  return (
    <AlertItem
      variant="warning"
      type="floating"
      className="mb-5"
      title={translate('This call requires a conflict of interest declaration')}
      body={translate(
        'You will be asked to confirm you have no conflict of interest with this proposal before your review can be submitted. If you do have one, decline the review now rather than reading further.',
      )}
    />
  );
};
