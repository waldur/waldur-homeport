import { useSelector } from 'react-redux';

import { BaseEventsList } from '@waldur/events/BaseEventsList';
import {
  SupportEventsFilter,
  selectSupportEventsFilter,
} from '@waldur/table/generated/SupportEventsFilter';

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
