import { ActionsDropdown } from '@/table/ActionsDropdown';

import { OrganizationGroupDeleteButton } from './OrganizationGroupDeleteButton';
import { OrganizationGroupDetailsButton } from './OrganizationGroupDetailsButton';
import { OrganizationGroupEditButton } from './OrganizationGroupEditButton';

export const OrganizationGroupRowActions = ({ row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        OrganizationGroupDetailsButton,
        OrganizationGroupEditButton,
        OrganizationGroupDeleteButton,
      ].filter(Boolean)}
    />
  );
};
