import { ChatTeardropTextIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { MenuAccordion } from '@/navigation/sidebar/MenuAccordion';
import { MenuItem } from '@/navigation/sidebar/MenuItem';
import { RoleEnum } from '@/permissions/enums';
import { useUser } from '@/workspace/hooks';

import { isDescendantOf } from '../useTabs';

const hasCallManagerRole = (user) =>
  user?.permissions?.some(
    (permission) =>
      permission.scope_type === 'call' &&
      permission.role_name === RoleEnum.CALL_MANAGER,
  );

interface CallPublicMenuProps {
  disabled?: boolean;
  disabledTooltip?: string;
}

export const CallPublicMenu: FC<CallPublicMenuProps> = ({
  disabled,
  disabledTooltip,
}) => {
  const { state } = useCurrentStateAndParams();
  const user = useUser();

  if (isFeatureVisible(MarketplaceFeatures.call_only)) {
    return (
      <MenuItem
        title={translate('Calls for proposals')}
        state="calls-for-proposals-dashboard"
        icon={<ChatTeardropTextIcon weight="bold" />}
        child={false}
        disabled={disabled}
        disabledTooltip={disabledTooltip}
      />
    );
  }
  if (
    !isFeatureVisible(MarketplaceFeatures.show_call_management_functionality)
  ) {
    return null;
  }

  const showAdminItems =
    user?.is_staff || user?.is_support || hasCallManagerRole(user);

  return (
    <MenuAccordion
      title={translate('Calls')}
      itemId="calls-menu"
      icon={<ChatTeardropTextIcon weight="bold" />}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
    >
      <MenuItem
        title={translate('Calls for proposals')}
        state="calls-for-proposals-dashboard"
        activeState={
          ['calls-for-proposals', 'protected-call', 'public-calls'].some(
            (name) => isDescendantOf(name, state),
          )
            ? state.name
            : undefined
        }
      />

      <MenuItem
        title={translate('My proposals')}
        state="proposals-all-proposals"
        activeState={
          isDescendantOf('proposals', state) ? state.name : undefined
        }
      />

      <MenuItem
        title={translate('My reviews')}
        state="reviews-all-reviews"
        activeState={isDescendantOf('reviews', state) ? state.name : undefined}
      />

      {showAdminItems && (
        <>
          <div className="menu-separator my-2" />
          <MenuItem
            title={translate('All proposals')}
            state="admin-proposals"
          />
          <MenuItem title={translate('All reviews')} state="admin-reviews" />
        </>
      )}
    </MenuAccordion>
  );
};
