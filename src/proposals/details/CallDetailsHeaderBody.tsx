import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

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
        <>
          <Field
            label={translate('Open round started')}
            value={formatDateTime(nextRound.start_time)}
          />
          <Field
            label={translate('Open round ends')}
            value={formatDateTime(nextRound.cutoff_time)}
          />
        </>
      )}
      {nextRound.status.label === 'Ended' && (
        <p className="text-danger">
          {translate('There are no open rounds. The call is closed.')}
        </p>
      )}
      {nextRound.status.label === 'Scheduled' && (
        <>
          <Field
            label={translate('Next round starts')}
            value={formatDateTime(nextRound.start_time)}
          />
          <Field
            label={translate('Next round ends')}
            value={formatDateTime(nextRound.cutoff_time)}
          />
        </>
      )}
    </>
  );
};
