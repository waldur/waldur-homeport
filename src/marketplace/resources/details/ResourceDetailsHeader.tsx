import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { ResourceStateField } from '../list/ResourceStateField';
import { ResourceActions } from '../ResourceActions';
import { Resource } from '../types';

import { EndDateField, ProjectEndDateField } from './EndDateField';
import { OfferingDetailsField } from './OfferingDetailsField';
import { ParentResourceLink } from './ParentResourceLink';
import { PlanDetailsField } from './PlanDetailsField';
import { ResourceMetadataLink } from './ResourceMetadataLink';
import { ResourceOrderItemsLink } from './ResourceOrderItemsLink';

interface ResourceDetailsHeaderProps {
  resource: Resource;
  reInitResource?(): void;
  scope;
}

export const ResourceDetailsHeader: FunctionComponent<ResourceDetailsHeaderProps> =
  ({ resource, scope, reInitResource }) => {
    return (
      <Card.Body className="d-flex flex-column">
        <div className="d-flex flex-grow-1">
          <div className="flex-grow-1">
            <h3>{resource.name}</h3>
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
            {resource.description ? <p>{resource.description}</p> : null}
          </div>
          <ResourceActions
            resource={{
              ...resource,
              marketplace_resource_uuid: resource.uuid,
            }}
            scope={scope}
            reInitResource={reInitResource}
          />
        </div>
        <div className="mt-7">
          <Field
            label={translate('State')}
            value={<ResourceStateField row={resource} />}
          />
          <OfferingDetailsField resource={resource} />
          <PlanDetailsField resource={resource} />
          <EndDateField resource={resource} />
          <ProjectEndDateField resource={resource} />

          <div className="d-flex justify-content-between mt-3">
            <ResourceMetadataLink resource={resource} scope={scope} />
            <ResourceOrderItemsLink resource={resource} />
          </div>
        </div>
      </Card.Body>
    );
  };
