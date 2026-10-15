import { ActionsDropdown } from '@/table/ActionsDropdown';

import { CreditUsageButton } from './CreditUsageButton';
import { ProjectDeleteCreditButton } from './ProjectDeleteCreditButton';
import { ProjectEditCreditButton } from './ProjectEditCreditButton';

/**
 * Editing and deleting a project credit is owner-only in Mastermind
 * (`is_owner`), while the list is shown to anyone who may view accounting.
 */
export const ProjectCreditReadOnlyActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[
      (props) => <CreditUsageButton {...props} row={row} scope="project" />,
    ]}
  />
);

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
