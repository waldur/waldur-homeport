import { useSelector } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { FilteredEventsButton } from '@waldur/events/FilteredEventsButton';
import { getProject } from '@waldur/workspace/selectors';

export const ProjectPermissionsLogButton = ({
  projectId,
  asDropdownItem,
}: {
  projectId?: string;
  asDropdownItem?: boolean;
}) => {
  const project = useSelector(getProject);
  return (
    <FilteredEventsButton
      filter={{
        scope: project?.url || `${ENV.apiEndpoint}api/projects/${projectId}/`,
        event_type: ['role_granted', 'role_revoked', 'role_updated'],
      }}
      asDropdownItem={asDropdownItem}
    />
  );
};
