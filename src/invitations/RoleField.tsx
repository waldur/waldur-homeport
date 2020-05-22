import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const RoleField = ({ invitation }) => {
  if (invitation.customer_role) {
    return <>{translate('owner')}</>;
  } else if (invitation.project_role) {
    if (!invitation.project) {
      return invitation.project_role;
    }
    return (
      <Link
        state="project.details"
        params={{ uuid: getUUID(invitation.project) }}
        label={translate('{role} in {project}', {
          role: translate(invitation.project_role),
          project: invitation.project_name,
        })}
      />
    );
  }
};
