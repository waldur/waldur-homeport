import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { EventsListData } from 'waldur-js-client';

import { BaseEventsList } from '@waldur/events/BaseEventsList';

import { SupportEventsFilter } from './SupportEventsFilter';

export const SupportEventsList = () => {
  const filtersSelector = createSelector(
    getFormValues('SupportEventsFilter'),
    (filterValues: any) => {
      const result: EventsListData['query'] = {};
      if (filterValues?.organization) {
        result.customer_uuid = filterValues.organization.uuid;
      }
      if (filterValues?.project) {
        result.project_uuid = filterValues.project.uuid;
      }
      if (filterValues?.user) {
        result.user_uuid = filterValues.user.uuid;
      }
      return result;
    },
  );

  const filter = useSelector(filtersSelector);

  return (
    <BaseEventsList
      table="support-events"
      filters={<SupportEventsFilter />}
      filter={filter}
    />
  );
};
