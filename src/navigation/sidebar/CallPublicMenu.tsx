import { ChatTeardropText } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { MenuAccordion } from '@waldur/navigation/sidebar/MenuAccordion';
import { MenuItem } from '@waldur/navigation/sidebar/MenuItem';

import { isDescendantOf } from '../useTabs';

export const CallPublicMenu = () => {
  const { state } = useCurrentStateAndParams();
  const visible = isFeatureVisible(
    MarketplaceFeatures.show_call_management_functionality,
  );
  if (!visible) {
    return null;
  }
  return (
    <MenuAccordion
      title={translate('Calls')}
      itemId="calls-menu"
      icon={<ChatTeardropText weight="bold" />}
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
