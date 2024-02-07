import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { formatDateTime, parseDate } from '@waldur/core/dateUtils';
import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { ProposalCall, ProposalCallRound } from '@waldur/proposals/types';

import { EditReviewInfoButton } from './EditReviewInfoButton';

interface RoundReviewSectionProps {
  round: ProposalCallRound;
  call: ProposalCall;
  refetch(): void;
  loading: boolean;
}

export const RoundReviewSection: FC<RoundReviewSectionProps> = ({
  round,
  call,
  refetch,
  loading,
}) => {
  const latestReviewDate = useMemo(() => {
    if (!round.cutoff_time || !round.review_duration_in_days) return null;
    return formatDateTime(
      parseDate(round.cutoff_time).plus({
        days: round.review_duration_in_days,
      }),
    );
  }, [round]);

  return (
    <Card id="review" className="mb-7">
      <Card.Header>
        <Card.Title>
          {translate('Review')}
          <RefreshButton refetch={refetch} loading={loading} />
        </Card.Title>
        <div className="card-toolbar">
          <EditReviewInfoButton round={round} call={call} refetch={refetch} />
        </div>
      </Card.Header>
      <Card.Body>
        <ReadOnlyFormControl
          key={round.review_strategy}
          label={translate('Review strategy')}
          value={round.review_strategy}
          className="col-12 col-md-6"
          floating
        />
        <ReadOnlyFormControl
          key={round.review_duration_in_days}
          label={translate('Review duration')}
          value={round.review_duration_in_days}
          className="col-12 col-md-6"
          floating
          addon={'days'}
        />
        <ReadOnlyFormControl
          key={round.minimum_number_of_reviewers}
          label={translate('Minimum reviewers')}
          value={round.minimum_number_of_reviewers}
          className="col-12 col-md-6"
          floating
        />
        {translate('Latest review completion date')}: {latestReviewDate}
      </Card.Body>
    </Card>
  );
};
