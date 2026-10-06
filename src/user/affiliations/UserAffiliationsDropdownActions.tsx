import { useCurrentStateAndParams } from '@uirouter/react';

import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { isDescendantOf } from '@/navigation/useTabs';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { AddOrganizationButton } from '@/user/dashboard/AddOrganizationButton';

export const UserAffiliationsDropdownActions = () => {
  const { state } = useCurrentStateAndParams();

  // Only show actions when viewing own profile (not when staff/support views another user)
  const isPersonalProfile = isDescendantOf('profile', state);

  const showCreateOrganization =
    isPersonalProfile && isFeatureVisible(CustomerFeatures.show_onboarding);

  // Don't render dropdown if no options are available
  const hasOptions = showCreateOrganization;
  if (!hasOptions) {
    return null;
  }

  return (
    <ActionsMenu side="bottom" toggle="add" size="lg" align="start">
      {showCreateOrganization && <AddOrganizationButton />}
    </ActionsMenu>
  );
};
