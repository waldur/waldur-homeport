import { AtIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { PermissionMap } from '@/permissions/enums';
import { getPermissionDisabledTooltip } from '@/permissions/utils';
import { ActionItem } from '@/resource/actions/ActionItem';

import { InvitationContext } from '../types';
import { useCreateInvitation } from '../useCreateInvitation';

export const InvitationCreateButton: FC<
  Omit<InvitationContext, 'customer' | 'user'> & {
    /** Decided by the caller when the scope has rules of its own, e.g. the
     * call managers who may invite to a proposal of their call. */
    canInvite?: boolean;
  }
> = ({ canInvite: canInviteOverride, ...context }) => {
  const {
    callback,
    canInvite: canInviteByPermission,
    loadingProjects,
  } = useCreateInvitation(context);
  const canInvite = canInviteOverride ?? canInviteByPermission;

  const permissions = context.roleTypes
    ?.map((rt) => PermissionMap[rt])
    .filter(Boolean);
  const tooltip = !canInvite
    ? getPermissionDisabledTooltip(permissions || [])
    : null;

  return (
    <ActionItem
      action={loadingProjects ? null : callback}
      title={translate('Invite by mail')}
      iconNode={
        loadingProjects ? <LoadingSpinnerSimple /> : <AtIcon weight="bold" />
      }
      disabled={!canInvite}
      tooltip={tooltip}
    />
  );
};
