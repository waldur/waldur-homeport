import { Fragment, FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const ProjectRolesList: FunctionComponent<{ roleName; row }> = ({
  roleName,
  row,
}) => {
  const filteredProjects = row.projects.filter(
    (item) => item.role_name === roleName,
  );
  if (filteredProjects.length === 0) {
    return <>{translate('No projects are assigned to this user.')}</>;
  }
  return (
    <>
      {filteredProjects.map((item, index) => {
        return (
          <Fragment key={index}>
            <Link
              state="project.dashboard"
              params={{ uuid: item.uuid }}
              label={item.name}
            />
            {index === filteredProjects.length - 1 ? null : ', '}
          </Fragment>
        );
      })}
    </>
  );
};
