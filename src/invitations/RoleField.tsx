import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const RoleField: FunctionComponent<{ invitation }> = ({
  invitation,
}) => {
  if (invitation.customer_role) {
    return <>{translate('Organization owner')}</>;
  } else if (invitation.project_role) {
    if (!invitation.project) {
      return (
        <>
          {ENV.roles[invitation.project_role]
            ? translate(ENV.roles[invitation.project_role])
            : ENV.roles[invitation.project_role]}
        </>
      );
    }
    return (
      <Link
        state="project.details"
        params={{ uuid: getUUID(invitation.project) }}
        label={translate('{role} in {project}', {
          role: ENV.roles[invitation.project_role]
            ? translate(ENV.roles[invitation.project_role])
            : ENV.roles[invitation.project_role],
          project: invitation.project_name,
        })}
      />
    );
  }
};
