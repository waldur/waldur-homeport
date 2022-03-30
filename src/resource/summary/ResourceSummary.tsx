import { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';

import { ResourceDetailsTable } from './ResourceDetailsTable';
import { ResourceSummaryBase } from './ResourceSummaryBase';

interface ResourceSummaryProps {
  resource: any;
}

export const ResourceSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  const {
    component: SummaryComponent = ResourceSummaryBase,
    useDefaultWrapper,
  } = ResourceSummaryRegistry.get(props.resource.resource_type) || {};
  const body = <SummaryComponent resource={props.resource} />;
  return useDefaultWrapper ? (
    <ResourceDetailsTable>{body}</ResourceDetailsTable>
  ) : (
    <Container>{body}</Container>
  );
};
