import { FunctionComponent, useMemo } from 'react';

import { BaseEventsList } from '@/events/BaseEventsList';
import { translate } from '@/i18n';
import {
  selectEventsFilter as selectSupportEventsFilter,
  EventsFilter as SupportEventsFilter,
} from '@/table/generated/EventsFilter';
import { useFilterValues } from '@/table/useFilterValues';
import { useProject } from '@/workspace/hooks';

export const ProjectEventsView: FunctionComponent = () => {
  const project = useProject();
  const tableId = `project-events-${project?.uuid}`;
  const values = useFilterValues(tableId);
  const filter = useMemo(() => selectSupportEventsFilter(values), [values]);
  return (
    <BaseEventsList
      table={tableId}
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
