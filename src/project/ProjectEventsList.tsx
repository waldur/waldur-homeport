import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';

import { BaseEventsList } from '@/events/BaseEventsList';
import { translate } from '@/i18n';
import {
  selectEventsFilter as selectSupportEventsFilter,
  EventsFilter as SupportEventsFilter,
  EventsFilterFormId,
} from '@/table/generated/EventsFilter';
import { useProject } from '@/workspace/hooks';

const ProjectEventsViewTable: FunctionComponent = () => {
  const project = useProject();
  const { values } = useFormState();
  const filter = useMemo(() => selectSupportEventsFilter(values), [values]);
  return (
    <BaseEventsList
      table={`project-events-${project?.uuid}`}
      title={translate('Audit logs')}
      filter={{
        ...filter,
        scope: project?.url,
      }}
      filters={<SupportEventsFilter />}
      initialPageSize={5}
    />
  );
};

export const ProjectEventsView = (props) => (
  <Form
    id={EventsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <ProjectEventsViewTable {...props} />}
  </Form>
);
