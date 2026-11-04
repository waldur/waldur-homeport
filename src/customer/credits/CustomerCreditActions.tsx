import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ReclassifyCreditButton, TopUpCreditButton } from './CreditLotActions';
import { CreditUsageButton } from './CreditUsageButton';
import { DeleteCreditButton } from './DeleteCreditButton';
import { EditCreditButton } from './EditCreditButton';

export const CustomerCreditActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[
      EditCreditButton,
      TopUpCreditButton,
      ReclassifyCreditButton,
      (props) => <CreditUsageButton {...props} row={row} scope="customer" />,
      DeleteCreditButton,
    ]}
  />
);
