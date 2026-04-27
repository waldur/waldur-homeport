import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AffiliatedOrganizationDeleteButton } from './AffiliatedOrganizationDeleteButton';
import { AffiliatedOrganizationEditButton } from './AffiliatedOrganizationEditButton';

export const AffiliatedOrganizationRowActions = ({ row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        AffiliatedOrganizationEditButton,
        AffiliatedOrganizationDeleteButton,
      ].filter(Boolean)}
    />
  );
};
