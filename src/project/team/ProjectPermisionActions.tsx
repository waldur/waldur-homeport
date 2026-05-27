import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { UserDetailsButton } from '@/user/UserDetailsButton';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { EditUserButton } from './EditUserButton';
import { UserRemoveButton } from './UserRemoveButton';

export const ProjectPermisionActions = ({
  row,
  fetch,
  projectUuid,
  customerUuid,
  project,
}) => {
  const user = useUser();
  const userIsStaffOrSupport = user?.is_staff || user?.is_support;
  const currentProject = useProject();
  const customer = useCustomer();

  const hasContext = projectUuid || customerUuid;
  const projectId = hasContext ? projectUuid : currentProject?.uuid;
  const customerId = hasContext ? customerUuid : customer?.uuid;

  const actions = [];

  if (userIsStaffOrSupport) {
    actions.push((props) => (
      <UserDetailsButton {...props} userId={row.user_uuid} />
    ));
  }

  // Lift Edit/Remove permission checks to the parent so `actions.length`
  // accurately reflects which actions will render. This lets us properly
  // disable the dropdown and show a tooltip when nothing is available.
  if (!project?.is_removed) {
    if (
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_PROJECT_PERMISSION,
        customerId,
        projectId,
      })
    ) {
      actions.push(EditUserButton);
    }
    if (
      hasPermission(user, {
        permission: PermissionEnum.DELETE_PROJECT_PERMISSION,
        customerId,
        projectId,
      })
    ) {
      actions.push(UserRemoveButton);
    }
  }

  const disabled = actions.length === 0;

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      data={{ projectUuid, customerUuid, project }}
      actions={actions}
      disabled={disabled}
      tooltip={
        disabled ? translate('No actions available for this user.') : null
      }
    />
  );
};
