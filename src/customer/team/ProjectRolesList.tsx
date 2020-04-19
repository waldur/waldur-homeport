import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const ProjectRolesList = ({ roleName, row }) => {
  const filteredProjects = row.projects.filter(item => item.role === roleName);
  if (filteredProjects.length === 0) {
    return <>{translate('No projects are assigned to this role.')}</>;
  }
  return (
    <>
      {filteredProjects.map((item, index) => {
        return (
          <React.Fragment key={index}>
            <Link
              state="project.details"
              params={{ uuid: item.uuid }}
              label={item.name}
            />
            {index === filteredProjects.length - 1 ? null : ', '}
          </React.Fragment>
        );
      })}
    </>
  );
};
