import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ScienceDomainDeleteButton } from './ScienceDomainDeleteButton';
import { ScienceDomainEditButton } from './ScienceDomainEditButton';

export const ScienceDomainRowActions = ({ row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[ScienceDomainEditButton, ScienceDomainDeleteButton].filter(
        Boolean,
      )}
    />
  );
};
