import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { useCurrentStateAndParams } from '@uirouter/react';

import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { isDescendantOf } from '@/navigation/useTabs';
import { AddDropdownToggle } from '@/table/ActionsDropdown';
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
    <RadixDropdownMenu.Root modal={false}>
      <RadixDropdownMenu.Trigger asChild>
        <AddDropdownToggle size="lg" />
      </RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align="start"
          sideOffset={2}
          className="dropdown-menu show position-static"
        >
          {showCreateOrganization && <AddOrganizationButton />}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
