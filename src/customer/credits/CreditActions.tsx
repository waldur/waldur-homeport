import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { CreditUsageButton } from './CreditUsageButton';
import { DeleteCreditButton } from './DeleteCreditButton';
import { EditCreditButton } from './EditCreditButton';

export const CreditActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[EditCreditButton, CreditUsageButton, DeleteCreditButton]}
  />
);
