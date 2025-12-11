import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { AddOrganizationButton } from './AddOrganizationButton';

export const UserProfileActions = () => {
  if (!isFeatureVisible(CustomerFeatures.show_onboarding)) {
    return null;
  }
  return (
    <ActionsDropdownComponent labeled drop="down">
      <AddOrganizationButton />
    </ActionsDropdownComponent>
  );
};
