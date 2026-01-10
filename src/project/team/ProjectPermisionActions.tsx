import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { UserDetailsButton } from '@waldur/user/UserDetailsButton';

import { EditUserButton } from './EditUserButton';
import { UserRemoveButton } from './UserRemoveButton';

export const ProjectPermisionActions = ({
  row,
  fetch,
  projectUuid,
  customerUuid,
  project,
}) => {
  const actions = [
    (props) => <UserDetailsButton {...props} userId={row.user_uuid} />,
  ];

  // Only add edit and remove actions if project is not removed
  if (!project?.is_removed) {
    actions.push(EditUserButton as any, UserRemoveButton as any);
  }

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      data={{ projectUuid, customerUuid, project }}
      actions={actions}
    />
  );
};
