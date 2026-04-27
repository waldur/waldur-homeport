import { ActionsDropdown } from '@/table/ActionsDropdown';

import { RobotAccountDeleteButton } from './RobotAccountDeleteButton';
import { RobotAccountEditButton } from './RobotAccountEditButton';

export const RobotAccountActions = ({ row, refetch }) =>
  row.backend_id ? (
    <>N/A</>
  ) : (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[RobotAccountEditButton, RobotAccountDeleteButton]}
    />
  );
