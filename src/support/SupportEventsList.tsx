import { useSelector } from 'react-redux';

import { BaseEventsList } from '@/events/BaseEventsList';
import {
  EventsFilter as SupportEventsFilter,
  selectEventsFilter as selectSupportEventsFilter,
} from '@/table/generated/EventsFilter';

export const SupportEventsList = () => {
  const filter = useSelector(selectSupportEventsFilter);

  return (
    <BaseEventsList
      table="support-events"
      filters={<SupportEventsFilter />}
      filter={filter}
    />
  );
};
