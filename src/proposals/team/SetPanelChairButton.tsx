import { CrownIcon, CrownSimpleIcon } from '@phosphor-icons/react';
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
  /** Re-fetch the call so the chair pointers (and their badges) update. */
  refetch?: () => void;
}

type Seat = 'panel_chair' | 'panel_vice_chair';

/**
 * One panel member can be flagged as chair of the call's review panel, and
 * another as its vice-chair. The backend keeps both pointers consistent with
 * the panel member role, so this only toggles them; removing the member
 * clears them server-side. One person holds one seat: taking the other seat
 * gives up the one held.
 */
export const SetPanelChairButton: FC<SetPanelChairButtonProps> = ({
  permission,
  call,
  refetch,
}) => {
  const user = permission.user_uuid;
  const isChair = call.panel_chair_uuid === user;
  const isViceChair = call.panel_vice_chair_uuid === user;
  const mutation = useManagedMutation<any, any, Partial<Record<Seat, any>>>({
    mutationFn: (body) =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: call.uuid },
        body,
      }),
    successMessage: translate('Panel chairs have been updated.'),
    errorMessage: translate('Unable to update panel chairs.'),
    refetch,
  });

  if (permission.role_name !== RoleEnum.CALL_PANEL_MEMBER) {
    return null;
  }

  const take = (seat: Seat) => {
    const other: Seat =
      seat === 'panel_chair' ? 'panel_vice_chair' : 'panel_chair';
    const holdsOther = seat === 'panel_chair' ? isViceChair : isChair;
    mutation.mutate(
      holdsOther ? { [seat]: user, [other]: null } : { [seat]: user },
    );
  };

  return (
    <>
      <ActionItem
        title={
          isChair
            ? translate('Unset panel chair')
            : translate('Set as panel chair')
        }
        action={() =>
          isChair ? mutation.mutate({ panel_chair: null }) : take('panel_chair')
        }
        disabled={mutation.isPending}
        iconNode={<CrownIcon weight="bold" />}
      />
      <ActionItem
        title={
          isViceChair
            ? translate('Unset vice-chair')
            : translate('Set as vice-chair')
        }
        action={() =>
          isViceChair
            ? mutation.mutate({ panel_vice_chair: null })
            : take('panel_vice_chair')
        }
        disabled={mutation.isPending}
        iconNode={<CrownSimpleIcon weight="bold" />}
      />
    </>
  );
};
