import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

export const ProjectActions = ({ project }: { project: Project }) => (
  <div>
    <Link
      state="project.manage"
      params={{ uuid: project.uuid }}
      className="btn btn-light me-3"
    >
      {translate('Manage')}
    </Link>

    <Link
      state="project.events"
      params={{ uuid: project.uuid }}
      className="btn btn-light me-3"
    >
      {translate('Audit logs')}
    </Link>

    <Link
      state="project.issues"
      params={{ uuid: project.uuid }}
      className="btn btn-light"
    >
      {translate('Issues')}
    </Link>
  </div>
);
