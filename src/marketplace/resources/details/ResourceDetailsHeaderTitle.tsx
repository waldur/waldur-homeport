import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ProjectUsersBadge } from '@waldur/project/ProjectUsersBadge';

import { ResourceSelectorToggle } from '../resource-selector/ResourceSelector';
import { Resource } from '../types';

import { ParentResourceLink } from './ParentResourceLink';

interface ResourceDetailsHeaderTitleProps {
  resource: Resource;
}

export const ResourceDetailsHeaderTitle: FunctionComponent<ResourceDetailsHeaderTitleProps> =
  ({ resource }) => {
    return (
      <>
        <ResourceSelectorToggle resource={resource} />
        <ParentResourceLink resource={resource} />
        <i>
          {`${resource.customer_name} / ${resource.project_name}`}{' '}
          <Link
            state="project.dashboard"
            params={{ uuid: resource.project_uuid }}
            className="text-muted text-decoration-underline text-hover-primary"
          >
            [{translate('Show project')}]
          </Link>
        </i>
        <ProjectUsersBadge />
        {resource.description ? <p>{resource.description}</p> : null}
      </>
    );
  };
