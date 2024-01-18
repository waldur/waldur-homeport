import { formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { ProposalCall } from '../types';

interface CallDetailsHeaderBodyProps {
  call: ProposalCall;
}

export const CallDetailsHeaderBody = (props: CallDetailsHeaderBodyProps) => {
  const nextRoundDate = props.call.rounds?.length
    ? props.call.rounds[0].cutoff_time
    : props.call.end_time;
  return (
    <>
      <p>{props.call.description}</p>
      <p>
        {translate('Next round ends in')}:{' '}
        <span className="text-danger">{formatRelative(nextRoundDate)}</span>
      </p>
    </>
  );
};
