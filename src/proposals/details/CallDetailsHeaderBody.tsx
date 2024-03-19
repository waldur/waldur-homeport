import { formatRelativeWithHour } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { Call } from '../types';
import { getRoundStatus, getSortedRoundsWithStatus } from '../utils';

interface CallDetailsHeaderBodyProps {
  call: Call;
}

export const CallDetailsHeaderBody = (props: CallDetailsHeaderBodyProps) => {
  const getSortedRounds = getSortedRoundsWithStatus(props.call.rounds);
  const lastRoundStatus = getRoundStatus(getSortedRounds[0]);
  const nextRoundDate = getSortedRounds?.length
    ? getSortedRounds[0].cutoff_time
    : props.call.end_time;

  return (
    <>
      <p>{props.call.description}</p>
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
    </>
  );
};
