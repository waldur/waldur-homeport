import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { MarketplaceResourceStateField } from '../list/MarketplaceResourceStateField';
import { ResourceActions } from '../ResourceActions';
import { Resource } from '../types';

import { OfferingDetailsField } from './OfferingDetailsField';
import { PlanDetailsField } from './PlanDetailsField';
import { ResourceMetadataLink } from './ResourceMetadataLink';
import { ResourceOrderItemsLink } from './ResourceOrderItemsLink';

interface ResourceDetailsHeaderProps {
  resource: Resource;
  reInitResource?(): void;
}

export const ResourceDetailsHeader: FunctionComponent<ResourceDetailsHeaderProps> =
  ({ resource }) => {
    return (
      <Card.Body className="d-flex flex-column">
        <div className="d-flex flex-grow-1">
          <div className="flex-grow-1">
            <h3>{resource.name}</h3>
            <i>{`${resource.customer_name} / ${resource.project_name}`}</i>
          </div>
          <ResourceActions resource={resource} />
        </div>
        <div className="mt-7">
          <Field
            label={translate('State')}
            value={<MarketplaceResourceStateField resource={resource} />}
          />
          <OfferingDetailsField resource={resource} />
          <PlanDetailsField resource={resource} />

          <div className="d-flex justify-content-between">
            <ResourceMetadataLink resource={resource} />
            <ResourceOrderItemsLink resource={resource} />
          </div>
        </div>
      </Card.Body>
    );
  };
