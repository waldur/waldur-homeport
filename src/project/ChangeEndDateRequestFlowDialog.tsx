import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { projectEndDateChangeRequestsList, Project } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getUser } from '@waldur/workspace/selectors';

import { ChangeEndDateRequestDialog } from './ChangeEndDateRequestDialog';
import { PendingRequestDialog } from './PendingRequestDialog';

interface ChangeEndDateRequestFlowDialogProps {
  resolve: {
    project: Project;
    refetch: () => void;
  };
}

export const ChangeEndDateRequestFlowDialog: FC<
  ChangeEndDateRequestFlowDialogProps
> = ({ resolve: { project, refetch } }) => {
  const user = useSelector(getUser);

  const { data: response, isLoading } = useQuery({
    queryKey: ['project-end-date-change-requests', project.uuid, user?.uuid],
    queryFn: () =>
      projectEndDateChangeRequestsList({
        query: {
          project_uuid: project.uuid,
          state: ['pending'],
          created_by_uuid: user?.uuid,
        },
      }),
    enabled: Boolean(project.uuid && user?.uuid),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const items = Array.isArray(response?.data) ? response.data : [];
  const pendingRequest = items.find((r) => r.created_by_uuid === user?.uuid);

  if (pendingRequest) {
    return <PendingRequestDialog request={pendingRequest} refetch={refetch} />;
  }

  return <ChangeEndDateRequestDialog project={project} refetch={refetch} />;
};
