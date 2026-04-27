import { ActionsDropdown } from '@/table/ActionsDropdown';

import { CreditUsageButton } from './CreditUsageButton';
import { ProjectDeleteCreditButton } from './ProjectDeleteCreditButton';
import { ProjectEditCreditButton } from './ProjectEditCreditButton';

export const ProjectCreditActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[
      ProjectEditCreditButton,
      (props) => <CreditUsageButton {...props} row={row} scope="project" />,
      ProjectDeleteCreditButton,
    ]}
  />
);
