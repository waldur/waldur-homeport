import * as React from 'react';

import { Link } from '@waldur/core/Link';

interface ProjectLinkProps {
  row: {
    project_name: string;
    project_uuid: string;
  };
}

export const ProjectLink = ({ row }: ProjectLinkProps) => (
  <Link
    state="project"
    params={{ uuid: row.project_uuid }}
    label={row.project_name}
  />
);
