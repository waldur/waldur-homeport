import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { BaseEventsList } from '@/events/BaseEventsList';
import { translate } from '@/i18n';
import {
  selectEventsFilter as selectSupportEventsFilter,
  EventsFilter as SupportEventsFilter,
} from '@/table/generated/EventsFilter';
import { getProject } from '@/workspace/selectors';

export const ProjectEventsView: FunctionComponent = () => {
  const project = useSelector(getProject);
  const filter = useSelector(selectSupportEventsFilter);
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
