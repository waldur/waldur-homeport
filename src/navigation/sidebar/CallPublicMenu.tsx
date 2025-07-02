import { ChatTeardropTextIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { MenuAccordion } from '@waldur/navigation/sidebar/MenuAccordion';
import { MenuItem } from '@waldur/navigation/sidebar/MenuItem';

import { isDescendantOf } from '../useTabs';

export const CallPublicMenu = () => {
  const { state } = useCurrentStateAndParams();
  if (isFeatureVisible(MarketplaceFeatures.call_only)) {
    return (
      <MenuItem
        title={translate('Calls for proposals')}
        state="calls-for-proposals-dashboard"
        icon={<ChatTeardropTextIcon weight="bold" />}
        child={false}
      />
    );
  }
  if (
    !isFeatureVisible(MarketplaceFeatures.show_call_management_functionality)
  ) {
    return null;
  }
  return (
    <MenuAccordion
      title={translate('Calls')}
      itemId="calls-menu"
      icon={<ChatTeardropTextIcon weight="bold" />}
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
        title={translate('Proposals')}
        state="proposals-all-proposals"
        activeState={
          isDescendantOf('proposals', state) ? state.name : undefined
        }
      />

      <MenuItem title={translate('Reviews')} state="reviews-all-reviews" />
    </MenuAccordion>
  );
};
