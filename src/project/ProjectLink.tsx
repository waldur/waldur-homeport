import { Link } from '@waldur/core/Link';

export const ProjectLink = ({ row }) => (
  <Link
    state="project.dashboard"
    params={{ uuid: row.uuid }}
    label={row.name}
  />
);
