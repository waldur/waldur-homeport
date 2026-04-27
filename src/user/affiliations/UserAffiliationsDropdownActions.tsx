import { CaretDownIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { Dropdown } from 'react-bootstrap';

import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { isDescendantOf } from '@/navigation/useTabs';
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
    <Dropdown placement="bottom-end">
      <Dropdown.Toggle
        variant="primary"
        size="lg"
        className="no-arrow btn-icon-right"
      >
        <span className="svg-icon svg-icon-2">
          <PlusCircleIcon weight="bold" />
        </span>
        {translate('Add')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
        {showCreateOrganization && <AddOrganizationButton />}
      </Dropdown.Menu>
    </Dropdown>
  );
};
