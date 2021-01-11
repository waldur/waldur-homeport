import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';

interface ProjectLinkProps {
  row: {
    project_name: string;
    project_uuid: string;
  };
}

export const ProjectLink: FunctionComponent<ProjectLinkProps> = ({ row }) => (
  <Link
    state="project.details"
    params={{ uuid: row.project_uuid }}
    label={row.project_name}
  />
);
