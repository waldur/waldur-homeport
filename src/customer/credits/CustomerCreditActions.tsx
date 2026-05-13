import { ActionsDropdown } from '@/table/ActionsDropdown';

import { CreditUsageButton } from './CreditUsageButton';
import { DeleteCreditButton } from './DeleteCreditButton';
import { EditCreditButton } from './EditCreditButton';

export const CustomerCreditActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[
      EditCreditButton,
      (props) => <CreditUsageButton {...props} row={row} scope="customer" />,
      DeleteCreditButton,
    ]}
  />
);
