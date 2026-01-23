import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { ProviderUserDetailsButton } from './ProviderUserDetailsButton';

export const ProviderUsersRowActions = ({ row }) => {
  return <ActionsDropdown row={row} actions={[ProviderUserDetailsButton]} />;
};
