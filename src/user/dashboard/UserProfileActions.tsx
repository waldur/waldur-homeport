import { useCurrentStateAndParams } from '@uirouter/react';

import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { AddOrganizationButton } from './AddOrganizationButton';

export const UserProfileActions = () => {
  const { state } = useCurrentStateAndParams();

  // Only show actions when viewing own profile (not when staff/support views another user)
  const isPersonalProfile = isDescendantOf('profile', state);

  if (
    !isPersonalProfile ||
    !isFeatureVisible(CustomerFeatures.show_onboarding)
  ) {
    return null;
  }
  return (
    <ActionsDropdownComponent labeled drop="down">
      <AddOrganizationButton />
    </ActionsDropdownComponent>
  );
};
