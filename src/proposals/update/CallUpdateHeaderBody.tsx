import { formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { ProposalCall } from '../types';

interface CallUpdateHeaderBodyProps {
  call: ProposalCall;
}

export const CallUpdateHeaderBody = (props: CallUpdateHeaderBodyProps) => {
  const nextRoundDate = props.call.rounds?.length
    ? props.call.rounds[0].cutoff_time
    : props.call.end_time;
  return (
    <p className="fw-bold">
      {translate('Next round ends in')}:{' '}
      <span className="text-danger">{formatRelative(nextRoundDate)}</span>
    </p>
  );
};
