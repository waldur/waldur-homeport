import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getProject as getProjectSelector } from '@waldur/workspace/selectors';

export const ProjectHoverableRow = ({ row }) => {
  const currentProject = useSelector(getProjectSelector);

  return currentProject?.uuid !== row.uuid ? (
    <Link state="project.dashboard" params={{ uuid: row.uuid }}>
      <Button
        variant="light"
        className="btn-active-primary min-w-90px pull-right"
        size="sm"
      >
        {translate('Select')}
      </Button>
    </Link>
  ) : (
    <Button
      variant="secondary"
      size="sm"
      disabled={true}
      className="pull-right"
    >
      {translate('Selected')}
    </Button>
  );
};
