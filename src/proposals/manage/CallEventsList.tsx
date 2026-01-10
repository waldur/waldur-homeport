import { FC, useMemo } from 'react';

import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';

import { Call } from '../types';

interface CallEventsListProps {
  call: Call;
}

export const CallEventsList: FC<CallEventsListProps> = ({ call }) => {
  const filter = useMemo(() => ({ scope: call.url }), [call]);
  return (
    <BaseEventsList
      filter={filter}
      table={`call-events-${call.uuid}`}
      title={translate('Events')}
      id="events"
    />
  );
};
