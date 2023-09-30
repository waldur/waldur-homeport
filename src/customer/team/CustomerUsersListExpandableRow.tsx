import { FunctionComponent, useMemo } from 'react';

import { ProjectRolesList } from '@waldur/customer/team/ProjectRolesList';
import { translate } from '@waldur/i18n';
import { getProjectRoles } from '@waldur/permissions/utils';

export const CustomerUsersListExpandableRow: FunctionComponent<any> = ({
  row,
}) => {
  const roles = useMemo(getProjectRoles, []);
  return (
    <>
      {roles.map((role) => (
        <p key={role.value}>
          <b>{translate('{label} in:', role)}</b>{' '}
          <ProjectRolesList roleName={role.value} row={row} />
        </p>
      ))}
    </>
  );
};
