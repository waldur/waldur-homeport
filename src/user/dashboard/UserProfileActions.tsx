import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { AddOrganizationButton } from './AddOrganizationButton';

export const UserProfileActions = () => {
  if (!isFeatureVisible(MarketplaceFeatures.show_experimental_ui_components)) {
    return null;
  }
  return (
    <ActionsDropdownComponent labeled drop="down">
      <AddOrganizationButton />
    </ActionsDropdownComponent>
  );
};
