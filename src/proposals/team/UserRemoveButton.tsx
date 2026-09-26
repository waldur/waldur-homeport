import React from 'react';

import { post } from '@/core/api';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { GenericPermission } from '@/permissions/types';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

type TeamScope = { url: string; uuid?: string; customer_uuid?: string };

interface UserRemoveButtonProps {
  permission: GenericPermission;
  scope: TeamScope;
  refetch;
}

/**
 * Mirrors UserRoleDeleteSerializer: the delete permission of the scope type,
 * held on the scope's organization or on the scope itself. The Team tab is
 * shared by calls and proposals, so either permission counts.
 */
export const useCanRemoveTeamMember = (scope: TeamScope): boolean => {
  const user = useUser();
  return [
    PermissionEnum.DELETE_CALL_PERMISSION,
    PermissionEnum.DELETE_PROPOSAL_PERMISSION,
  ].some((permission) =>
    hasPermission(user, {
      permission,
      scopeId: scope?.uuid,
      customerId: scope?.customer_uuid,
    }),
  );
};

export const UserRemoveButton: React.FC<UserRemoveButtonProps> = ({
  permission,
  scope,
  refetch,
}) => {
  const canRemove = useCanRemoveTeamMember(scope);
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
  if (!canRemove) return null;
  return (
    <RemovalActionItem
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      title={translate('Remove')}
    />
  );
};
