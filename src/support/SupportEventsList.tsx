import { useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';

import { BaseEventsList } from '@/events/BaseEventsList';
import {
  EventsFilter as SupportEventsFilter,
  selectEventsFilter as selectSupportEventsFilter,
  EventsFilterFormId,
} from '@/table/generated/EventsFilter';

const SupportEventsListTable = () => {
  const { values } = useFormState();
  const filter = useMemo(() => selectSupportEventsFilter(values), [values]);

  return (
    <BaseEventsList
      table="support-events"
      filters={<SupportEventsFilter />}
      filter={filter}
    />
  );
};

export const SupportEventsList = (props) => (
  <Form
    id={EventsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <SupportEventsListTable {...props} />}
  </Form>
);
