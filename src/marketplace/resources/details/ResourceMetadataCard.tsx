import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ResourceSummaryBase } from '@waldur/resource/summary';
import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';

import { ResourceSummary } from './ResourceSummary';

export const ResourceMetadataCard = ({ resource, scope }) => {
  const SummaryComponent =
    ResourceSummaryRegistry.get(resource.resource_type) || ResourceSummaryBase;

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Resource details')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <ResourceSummary resource={resource} scope={scope}>
          {scope && <SummaryComponent resource={scope} />}
        </ResourceSummary>
      </Card.Body>
    </Card>
  );
};
