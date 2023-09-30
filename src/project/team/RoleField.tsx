import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { getUUID } from '@waldur/core/utils';
import { formatRole } from '@waldur/permissions/utils';

export const RoleField: FunctionComponent<{ invitation }> = ({
  invitation,
}) => {
  if (invitation.project_role) {
    if (!invitation.project) {
      return <>{formatRole(invitation.project_role)}</>;
    }
    return (
      <Link
        state="project.dashboard"
        params={{ uuid: getUUID(invitation.project) }}
        label={formatRole(invitation.project_role)}
      />
    );
  }
  return null;
};
