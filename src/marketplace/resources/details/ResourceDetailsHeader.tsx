import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { MarketplaceResourceStateField } from '../list/MarketplaceResourceStateField';
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
            <i>{`${resource.customer_name} / ${resource.project_name}`}</i>
            {resource.description ? <p>{resource.description}</p> : null}
          </div>
          <ResourceActions
            resource={resource}
            scope={scope}
            reInitResource={reInitResource}
          />
        </div>
        <div className="mt-7">
          <Field
            label={translate('State')}
            value={<MarketplaceResourceStateField resource={resource} />}
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
