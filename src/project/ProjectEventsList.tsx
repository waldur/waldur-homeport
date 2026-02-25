import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import {
  selectEventsFilter as selectSupportEventsFilter,
  EventsFilter as SupportEventsFilter,
} from '@waldur/table/generated/EventsFilter';
import { getProject } from '@waldur/workspace/selectors';

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
