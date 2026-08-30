import { CrownIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RoleEnum } from '@/permissions/enums';
import { GenericPermission } from '@/permissions/types';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';

interface SetPanelChairButtonProps {
  permission: GenericPermission;
  call: Call;
  /** Re-fetch the call so `panel_chair_uuid` (and the Chair badge) update. */
  refetch?: () => void;
}

/**
 * One panel member can be flagged as chair of the call's review panel. The
 * backend keeps `Call.panel_chair` consistent with the panel member role, so
 * this only toggles the pointer; removing the member clears it server-side.
 */
export const SetPanelChairButton: FC<SetPanelChairButtonProps> = ({
  permission,
  call,
  refetch,
}) => {
  const isChair = call.panel_chair_uuid === permission.user_uuid;
  const mutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: call.uuid },
        body: { panel_chair: isChair ? null : permission.user_uuid },
      }),
    successMessage: isChair
      ? translate('Panel chair has been unset.')
      : translate('Panel chair has been set.'),
    errorMessage: translate('Unable to update panel chair.'),
    refetch,
  });

  if (permission.role_name !== RoleEnum.CALL_PANEL_MEMBER) {
    return null;
  }

  return (
    <ActionItem
      title={
        isChair
          ? translate('Unset panel chair')
          : translate('Set as panel chair')
      }
      action={() => mutation.mutate()}
      disabled={mutation.isPending}
      iconNode={<CrownIcon weight="bold" />}
    />
  );
};
