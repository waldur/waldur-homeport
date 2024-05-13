import { ChatTeardropText } from '@phosphor-icons/react';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { MenuAccordion } from '@waldur/navigation/sidebar/MenuAccordion';
import { MenuItem } from '@waldur/navigation/sidebar/MenuItem';

export const CallPublicMenu = () => {
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
      icon={<ChatTeardropText />}
    >
      <MenuItem
        title={translate('Calls for proposals')}
        state="calls-for-proposals-dashboard"
      />
      <MenuItem
        title={translate('Proposals')}
        state="proposals-all-proposals"
      />
      <MenuItem title={translate('Reviews')} state="reviews-all-reviews" />
    </MenuAccordion>
  );
};
