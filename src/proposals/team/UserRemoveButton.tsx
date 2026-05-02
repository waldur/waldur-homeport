import React from 'react';

import { post } from '@/core/api';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { GenericPermission } from '@/permissions/types';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface UserRemoveButtonProps {
  permission: GenericPermission;
  scope: { url: string };
  refetch;
}

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  permission,
  scope,
  refetch,
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      post(`${scope.url}delete_user/`, {
        user: permission.user_uuid,
        role: permission.role_name,
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
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      title={translate('Remove')}
    />
  );
};
