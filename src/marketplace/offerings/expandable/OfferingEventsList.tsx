import { useMemo } from 'react';

import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';

export const OfferingEventsList = ({ offering }) => {
  const filter = useMemo(
    () => ({
      scope: offering.url,
    }),
    [offering],
  );
  return (
    <BaseEventsList
      filter={filter}
      table={`events-${offering.uuid}`}
      title={translate('Events')}
      id="events"
    />
  );
};
