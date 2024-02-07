import { formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { ProposalCallRound } from '../types';

interface RoundPageHeaderBodyProps {
  round: ProposalCallRound;
}

export const RoundPageHeaderBody = (props: RoundPageHeaderBodyProps) => {
  return (
    <p className="fw-bold">
      {translate('Next round ends in')}:{' '}
      <span className="text-danger">
        {formatRelative(props.round.cutoff_time)}
      </span>
    </p>
  );
};
