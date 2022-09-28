import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ResourceOrderItemsLink } from '@waldur/marketplace/resources/ResourceOrderItemsLink';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Field } from '@waldur/resource/summary';

import { ResourceActions } from './ResourceActions';
import { ResourceMetadataLink } from './ResourceMetadataLink';

export const ResourceHeader = ({ resource }) => (
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
        value={<ResourceState resource={resource} />}
      />
      <div className="d-flex justify-content-between">
        <ResourceMetadataLink resource={resource} />
        <ResourceOrderItemsLink resource={resource} />
      </div>
    </div>
  </Card.Body>
);
