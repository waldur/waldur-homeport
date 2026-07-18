import { MaintenanceAnnouncement } from 'waldur-js-client';

import { FilteredEventsButton } from '@/events/FilteredEventsButton';

export const MaintenanceHistoryLogAction = ({
  row,
}: {
  row: MaintenanceAnnouncement;
}) => <FilteredEventsButton filter={{ scope: row.url }} asDropdownItem />;
