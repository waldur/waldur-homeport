import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { formatRole, getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const RoleField: FunctionComponent<{ invitation }> = ({
  invitation,
}) => {
  if (invitation.customer_role) {
    return <>{formatRole(invitation.customer_role)}</>;
  } else if (invitation.project_role) {
    if (!invitation.project) {
      return <>{formatRole(invitation.project_role)}</>;
    }
    return (
      <Link
        state="project.details"
        params={{ uuid: getUUID(invitation.project) }}
        label={translate('{role} in {project}', {
          role: formatRole(invitation.project_role),
          project: invitation.project_name,
        })}
      />
    );
  }
};
