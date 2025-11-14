import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { AddOrganizationButton } from './AddOrganizationButton';

export const UserProfileActions = () => {
  return (
    <ActionsDropdownComponent labeled drop="down">
      <AddOrganizationButton />
    </ActionsDropdownComponent>
  );
};
