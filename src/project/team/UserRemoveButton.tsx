import React from 'react';
import { projectsDeleteUser } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { GenericPermission } from '@/permissions/types';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useProject } from '@/workspace/hooks';

interface UserRemoveButtonProps {
  row: GenericPermission;
  refetch(): void;
  projectUuid?;
  customerUuid?;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  row: permission,
  refetch,
  projectUuid,
}) => {
  const project = useProject();

  const projectId = projectUuid || project?.uuid;

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      projectsDeleteUser({
        path: { uuid: projectId },
        body: {
          user: permission.user_uuid,
          role: permission.role_name,
        },
      }),
    successMessage: translate('Team member has been removed.'),
    errorMessage: translate('Unable to delete team member.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to remove {userName}?', {
        userName: permission.user_full_name || permission.user_username,
      }),
    },
  });
  return (
    <RemovalActionItem
      action={mutate}
      disabled={isPending}
      title={translate('Remove')}
      size="sm"
    />
  );
};
