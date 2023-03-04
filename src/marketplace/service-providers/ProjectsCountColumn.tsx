import { translate } from '@waldur/i18n';

export const ProjectsCountColumn = ({ row }) => (
  <>
    {row.projects_count === 0
      ? translate('No active projects')
      : row.projects_count === 1
      ? translate('One project')
      : translate('{count} projects', { count: row.projects_count })}
  </>
);
