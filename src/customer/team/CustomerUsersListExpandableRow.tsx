import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { RoleField } from '@waldur/user/affiliations/RoleField';

import { AddProjectUserButton } from './AddProjectUserButton';
import { DeleteProjectUserButton } from './DeleteProjectUserButton';
import { EditProjectUserButton } from './EditProjectUserButton';
import { NestedCustomerPermission } from './types';

export const CustomerUsersListExpandableRow: FunctionComponent<{
  row: NestedCustomerPermission;
  refetch;
}> = ({ row, refetch }) => {
  return row.projects.length === 0 ? (
    <>
      <p>{translate('No projects are assigned to this user.')}</p>
      <AddProjectUserButton customer={row} refetch={refetch} />
    </>
  ) : (
    <>
      <AddProjectUserButton customer={row} refetch={refetch} />
      <table className="table">
        <thead>
          <tr>
            <td>{translate('Project name')}</td>
            <td>{translate('Role')}</td>
            <td>{translate('Expiration time')}</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {row.projects.map((project, index) => (
            <tr key={index}>
              <td>
                <Link
                  state="project.dashboard"
                  params={{ uuid: project.uuid }}
                  label={project.name}
                />
              </td>
              <td>
                <RoleField row={project} />
              </td>
              <td>
                {project.expiration_time
                  ? formatDateTime(project.expiration_time)
                  : 'N/A'}
              </td>
              <td>
                <EditProjectUserButton
                  customer={row}
                  project={project}
                  refetch={refetch}
                />
                <DeleteProjectUserButton
                  customer={row}
                  project={project}
                  refetch={refetch}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
