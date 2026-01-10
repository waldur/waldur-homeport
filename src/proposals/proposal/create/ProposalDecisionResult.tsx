import { CheckCircleIcon, EyeIcon, XCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { Proposal, ProposalReview } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';

import { RateStars } from '../create-review/RateStars';

const ProposalReviewDialog = lazyComponent(() =>
  import('./ProposalReviewDialog').then((module) => ({
    default: module.ProposalReviewDialog,
  })),
);

interface ProposalDecisionResultProps {
  proposal: Proposal;
  reviews?: ProposalReview[];
}

export const ProposalDecisionResult: FC<ProposalDecisionResultProps> = ({
  proposal,
  reviews,
}) => {
  const user = useUser();
  const userIsSubmitter = user.uuid === proposal.created_by_uuid;
  const isFinalState = ['accepted', 'rejected'].includes(proposal.state);

  const acceptedMessage = userIsSubmitter
    ? translate('Your proposal has been successfully accepted.')
    : translate('The proposal has been successfully accepted.');
  const declinedMessage = userIsSubmitter
    ? translate('Your proposal has been declined.')
    : translate('The proposal has been declined.');
  const message =
    proposal.state === 'accepted' ? acceptedMessage : declinedMessage;

  const overallScore = useMemo(() => {
    if (!reviews?.length) return 0;
    return (
      reviews.reduce((acc, value) => acc + value.summary_score, 0) /
      reviews.length
    ).toPrecision(2);
  }, [reviews]);

  const dispatch = useDispatch();
  return (
    <Card className="card-bordered">
      <Card.Body>
        <div className="d-flex align-items-center flex-wrap gap-4">
          {isFinalState ? (
            <div className="d-flex align-items-center">
              {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
              <FeaturedIcon
                IconComponent={
                  proposal.state === 'accepted' ? CheckCircleIcon : XCircleIcon
                }
                className="me-2"
                variant={proposal.state === 'accepted' ? 'success' : 'danger'}
              />

              <p className="mb-0 fw-bold fs-6">{message}</p>
            </div>
          ) : (
            <p className="mb-0 fw-bold fs-6">{translate('Review summary')}</p>
          )}
          <div className="d-flex align-items-center flex-grow-1 flex-wrap gap-4">
            <RateStars value={overallScore} className="mb-2" />
            <span className="fs-6 text-gray-700">
              {overallScore === '1.0'
                ? translate('1 star rate')
                : translate('{count} stars rate', { count: overallScore })}
            </span>
            <ActionButton
              action={() =>
                dispatch(
                  openModalDialog(ProposalReviewDialog, {
                    reviews,
                    size: 'sm',
                  }),
                )
              }
              title={translate('More details')}
              iconNode={<EyeIcon weight="bold" />}
              variant="tertiary"
              className="ms-auto"
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
