import { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';

import { ResourceSummaryBase } from './ResourceSummaryBase';

interface ResourceSummaryProps {
  resource: any;
}

export const ResourceSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  const SummaryComponent = ResourceSummaryRegistry.get(
    props.resource.resource_type,
  );
  return (
    <Container>
      <ResourceSummaryBase resource={props.resource} />
      {SummaryComponent && <SummaryComponent resource={props.resource} />}
    </Container>
  );
};
