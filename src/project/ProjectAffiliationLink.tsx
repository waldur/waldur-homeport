import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';

interface ProjectAffiliationLinkProps {
  row: {
    project_name: string;
    project_uuid: string;
  };
}

export const ProjectAffiliationLink: FunctionComponent<ProjectAffiliationLinkProps> =
  ({ row }) => (
    <Link
      state="project.dashboard"
      params={{ uuid: row.project_uuid }}
      label={row.project_name}
    />
  );
