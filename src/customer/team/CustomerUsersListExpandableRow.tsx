import { FunctionComponent } from 'react';
import { CustomerUser } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { RoleField } from '@waldur/user/affiliations/RoleField';

import { AddProjectUserButton } from './AddProjectUserButton';
import { DeleteProjectUserButton } from './DeleteProjectUserButton';
import { EditProjectUserButton } from './EditProjectUserButton';

const RowActions = ({ row, refetch, project }) => {
  return (
    <ActionsDropdownComponent>
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
    </ActionsDropdownComponent>
  );
};

export const CustomerUsersListExpandableRow: FunctionComponent<{
  row: CustomerUser;
  refetch;
}> = ({ row, refetch }) => {
  return row.projects.length === 0 ? (
    <div className="text-center py-4">
      <p>{translate('No projects are assigned to this user.')}</p>
      <AddProjectUserButton customer={row} refetch={refetch} />
    </div>
  ) : (
    <ExpandableContainer hasMultiSelect>
      <table className="table align-middle gy-0 mb-0">
        <thead className="border-bottom">
          <tr>
            <th className="text-dark">{translate('Project name')}</th>
            <th />
            <th className="text-dark w-25">{translate('Role')}</th>
            <th className="text-dark w-45px">{translate('Expiration time')}</th>
            <th className="header-actions text-dark">{translate('Actions')}</th>
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
              <td />
              <td>
                <RoleField row={project} />
              </td>
              <td>
                {project.expiration_time
                  ? formatDateTime(project.expiration_time)
                  : 'N/A'}
              </td>
              <td className="row-actions">
                <div>
                  <RowActions row={row} refetch={refetch} project={project} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ExpandableContainer>
  );
};
