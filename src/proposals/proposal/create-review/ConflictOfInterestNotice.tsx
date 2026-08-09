import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

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
    <div className="alert alert-warning d-flex align-items-start gap-3 mb-5">
      <WarningCircleIcon
        weight="bold"
        size={20}
        className="mt-1 flex-shrink-0"
      />
      <div>
        <div className="fw-bold">
          {translate('This call requires a conflict of interest declaration')}
        </div>
        <div className="fs-7">
          {translate(
            'You will be asked to confirm you have no conflict of interest with this proposal before your review can be submitted. If you do have one, decline the review now rather than reading further.',
          )}
        </div>
      </div>
    </div>
  );
};
