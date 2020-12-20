import { FunctionComponent } from 'react';

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
    <dl className="dl-horizontal col-sm-12">{body}</dl>
  );
};
