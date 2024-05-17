import { formatRelativeWithHour } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { Call } from '../types';
import { getRoundsWithStatus } from '../utils';

interface CallDetailsHeaderBodyProps {
  call: Call;
}

export const CallDetailsHeaderBody = (props: CallDetailsHeaderBodyProps) => {
  const nextRound = getRoundsWithStatus(props.call.rounds)[0];
  return (
    <>
      {nextRound.status.label === 'Open' && (
        <p>
          {translate('Open round ends')}:{' '}
          <span className="text-danger">
            {formatRelativeWithHour(nextRound.cutoff_time)}
          </span>
        </p>
      )}
      {nextRound.status.label === 'Ended' && (
        <p className="text-danger">
          {translate('There are no open rounds. The call is closed.')}
        </p>
      )}
    </>
  );
};
