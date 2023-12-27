import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';

import { Resource } from '../types';

import { EndDateField, ProjectEndDateField } from './EndDateField';
import { OfferingDetailsField } from './OfferingDetailsField';
import { ResourceOpenStackInstanceSummary } from './openstack-instance/ResourceOpenStackInstanceSummary';
import { PlanDetailsField } from './PlanDetailsField';
import { ResourceMetadataLink } from './ResourceMetadataLink';
import { ResourceOrdersLink } from './ResourceOrdersLink';
import { ResourceTypeField } from './ResourceTypeField';

interface ResourceDetailsHeaderBodyProps {
  resource: Resource;
  offering;
  scope;
}

export const ResourceDetailsHeaderBody: FunctionComponent<ResourceDetailsHeaderBodyProps> =
  ({ resource, offering, scope }) => {
    return (
      <>
        {resource.description ? <p>{resource.description}</p> : null}
        {resource.resource_type === INSTANCE_TYPE ? (
          <ResourceOpenStackInstanceSummary scope={scope} />
        ) : (
          <>
            <ResourceTypeField resource={resource} />
            <OfferingDetailsField offering={offering} />
            <PlanDetailsField resource={resource} />
            <EndDateField resource={resource} />
            <ProjectEndDateField resource={resource} />
          </>
        )}

        <div className="d-flex justify-content-between flex-wrap mt-4">
          <div className="mt-3">
            <i>
              {resource.customer_name}
              {' / '}
              <Link
                state="project.dashboard"
                params={{ uuid: resource.project_uuid }}
                className="text-muted text-decoration-underline text-hover-primary"
              >
                {resource.project_name}
              </Link>
            </i>
          </div>
          <div className="d-flex gap-4 mt-3">
            <ResourceMetadataLink resource={resource} scope={scope} />
            <ResourceOrdersLink resource={resource} />
          </div>
        </div>
      </>
    );
  };
