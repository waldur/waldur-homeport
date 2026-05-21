import { ENV } from '@/core/config';
import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { useProject } from '@/workspace/hooks';

export const ProjectPermissionsLogButton = ({
  projectId,
  asDropdownItem,
}: {
  projectId?: string;
  asDropdownItem?: boolean;
}) => {
  const project = useProject();
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
