import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getProject as getProjectSelector } from '@waldur/workspace/selectors';

export const ProjectHoverableRow = ({ row }) => {
  const currentProject = useSelector(getProjectSelector);

  return currentProject?.uuid !== row.project_uuid ? (
    <Link
      className="btn btn-light btn-active-primary min-w-90px pull-right me-3"
      state="project.dashboard"
      params={{ uuid: row.project_uuid }}
    >
      {translate('Select')}
    </Link>
  ) : (
    <Button variant="secondary" disabled={true} className="pull-right me-3">
      {translate('Selected')}
    </Button>
  );
};
