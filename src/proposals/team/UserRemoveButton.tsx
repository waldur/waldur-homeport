import React from 'react';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { GenericPermission } from '@/permissions/types';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

import { deleteTeamUser, TeamScopeType } from './teamApi';

type TeamScope = { url: string; uuid?: string; customer_uuid?: string };

interface UserRemoveButtonProps {
  permission: GenericPermission;
  scope: TeamScope;
  scopeType: TeamScopeType;
  refetch;
  /** Decided by the caller when the scope has rules of its own; the team
   * permission is then not consulted at all. */
  canRemove?: boolean;
  /** Shown as the tooltip of a disabled Remove, e.g. the last manager. */
  disabledReason?: string;
}

/**
 * Mirrors UserRoleDeleteSerializer: the delete permission of the scope type,
 * held on the scope's organization or on the scope itself. The Team tab is
 * shared by calls and proposals, so either permission counts. With `skip`
 * the caller decides instead and nothing is checked.
 */
export const useCanRemoveTeamMember = (
  scope: TeamScope,
  skip = false,
): boolean => {
  const user = useUser();
  if (skip) {
    return false;
  }
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
  scopeType,
  refetch,
  canRemove: canRemoveOverride,
  disabledReason,
}) => {
  const canRemoveByPermission = useCanRemoveTeamMember(
    scope,
    canRemoveOverride !== undefined,
  );
  const canRemove = canRemoveOverride ?? canRemoveByPermission;
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      deleteTeamUser(scopeType, scope.uuid, {
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
      disabled={deleteMutation.isPending || Boolean(disabledReason)}
      tooltip={disabledReason}
      title={translate('Remove')}
    />
  );
};
