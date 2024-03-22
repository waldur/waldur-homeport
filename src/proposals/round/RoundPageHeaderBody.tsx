import { formatDateTime, formatRelativeWithHour } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { Round } from '../types';
import { getRoundStatus } from '../utils';

interface RoundPageHeaderBodyProps {
  round: Round;
}

export const RoundPageHeaderBody = (props: RoundPageHeaderBodyProps) => {
  const roundStatus = getRoundStatus(props.round);
  return (
    <p className="fw-bold">
      {roundStatus.label === 'Open' && (
        <p>
          {translate('Open round ends')}:{' '}
          <span className="text-danger">
            {formatRelativeWithHour(props.round.cutoff_time)}
          </span>
        </p>
      )}
      {roundStatus.label === 'Ended' && (
        <p>
          {translate('The round has ended on: ')}
          <span className="text-danger">
            {formatDateTime(props.round.cutoff_time)}
          </span>
        </p>
      )}
      {roundStatus.label === 'Scheduled' && (
        <p>
          {translate('The round will be open on: ')}
          <span className="text-danger">
            {formatDateTime(props.round.start_time)}
          </span>
        </p>
      )}
    </p>
  );
};
