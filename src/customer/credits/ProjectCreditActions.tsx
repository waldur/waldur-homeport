import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { CreditUsageButton } from './CreditUsageButton';
import { ProjectDeleteCreditButton } from './ProjectDeleteCreditButton';
import { ProjectEditCreditButton } from './ProjectEditCreditButton';

export const ProjectCreditActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[
      ProjectEditCreditButton,
      CreditUsageButton,
      ProjectDeleteCreditButton,
    ]}
  />
);
