import { useMemo } from 'react';

import { BaseEventsList } from '@/events/BaseEventsList';
import { translate } from '@/i18n';

export const ProviderEventsTable = ({ provider }) => {
  const filter = useMemo(
    () => ({
      scope: provider ? provider.customer : undefined,
      feature: ['providers'],
    }),
    [provider],
  );
  return (
    <BaseEventsList
      title={translate('Audit logs')}
      filter={filter}
      table={`events-${provider?.uuid}`}
    />
  );
};
