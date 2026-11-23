import { FC } from 'react';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { SITE_AGENT_TEMPLATE } from '@/user/personal-access-tokens/wizard/tokenPayload';
import { useUser } from '@/workspace/hooks';

import { useSiteAgentTokenTarget } from './useSiteAgentTokenTarget';

const PersonalAccessTokenCreateDialog = lazyComponent(() =>
  import('@/user/personal-access-tokens/PersonalAccessTokenCreateDialog').then(
    (module) => ({ default: module.PersonalAccessTokenCreateDialog }),
  ),
);

interface CreateAgentTokenMenuItemProps {
  offering: {
    uuid: string;
    name: string;
    customer_uuid?: string | null;
  };
}

/**
 * The Actions menu's entry that opens the token wizard for this offering's
 * site agent. Enabled for the
 * offering's managers, for whom the backend lists it as a target. Someone
 * who can manage the offering's team but is not its manager (an owner, say)
 * sees it disabled, since adding themselves as manager fixes that; anyone
 * else does not see it.
 */
export const CreateAgentTokenMenuItem: FC<CreateAgentTokenMenuItemProps> = ({
  offering,
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  const { data: target, isLoading } = useSiteAgentTokenTarget(offering.uuid);

  if (isLoading) return null;

  if (!target) {
    const canManageTeam = hasPermission(user, {
      permission: PermissionEnum.UPDATE_OFFERING,
      customerId: offering.customer_uuid ?? undefined,
      offeringId: offering.uuid,
    });
    if (!canManageTeam) return null;
  }

  return (
    <Menu.Item
      disabled={!target}
      tooltip={
        target
          ? undefined
          : translate(
              "Add yourself as this offering's manager to create an agent token.",
            )
      }
      onSelect={() =>
        target &&
        openDialog(PersonalAccessTokenCreateDialog, {
          size: 'lg',
          resolve: {
            preset: {
              template: SITE_AGENT_TEMPLATE,
              target,
              offering: { uuid: offering.uuid, name: offering.name },
            },
          },
        })
      }
    >
      {translate('Create agent token')}
    </Menu.Item>
  );
};
