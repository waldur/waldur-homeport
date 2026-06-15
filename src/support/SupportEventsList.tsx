import { useMemo } from 'react';

import { BaseEventsList } from '@/events/BaseEventsList';
import {
  EventsFilter as SupportEventsFilter,
  selectEventsFilter as selectSupportEventsFilter,
} from '@/table/generated/EventsFilter';
import { useFilterValues } from '@/table/useFilterValues';

export const SupportEventsList = () => {
  const values = useFilterValues('support-events');
  const filter = useMemo(() => selectSupportEventsFilter(values), [values]);

  return (
    <BaseEventsList
      table="support-events"
      filters={<SupportEventsFilter />}
      filter={filter}
    />
  );
};
