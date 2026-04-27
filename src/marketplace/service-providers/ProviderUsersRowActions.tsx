import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ProviderUserDetailsButton } from './ProviderUserDetailsButton';

export const ProviderUsersRowActions = ({ row }) => {
  return <ActionsDropdown row={row} actions={[ProviderUserDetailsButton]} />;
};
