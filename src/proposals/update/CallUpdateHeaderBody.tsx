import { formatRelativeWithHour } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { Call } from '../types';
import { getSortedRoundsWithStatus, getRoundStatus } from '../utils';

interface CallUpdateHeaderBodyProps {
  call: Call;
}

export const CallUpdateHeaderBody = (props: CallUpdateHeaderBodyProps) => {
  const getSortedRounds = getSortedRoundsWithStatus(props.call.rounds);
  const lastRoundStatus = getRoundStatus(getSortedRounds[0]);
  const nextRoundDate = getSortedRounds?.length
    ? getSortedRounds[0].cutoff_time
    : props.call.end_time;
  return (
    <p className="fw-bold">
      {lastRoundStatus.label === 'Open' && (
        <p>
          {translate('Open round ends')}:{' '}
          <span className="text-danger">
            {formatRelativeWithHour(nextRoundDate)}
          </span>
        </p>
      )}
      {lastRoundStatus.label === 'Ended' && (
        <p className="text-danger">
          {translate('There are no open rounds. The call is closed.')}
        </p>
      )}
    </p>
  );
};
