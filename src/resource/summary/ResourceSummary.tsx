import { FunctionComponent } from 'react';

import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';

import './resource-summary.scss';
import { ResourceSummaryBase } from './ResourceSummaryBase';

interface ResourceSummaryProps {
  resource: any;
}

export const ResourceSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  const { component: SummaryComponent = ResourceSummaryBase, className } =
    ResourceSummaryRegistry.get(props.resource.resource_type) || {};
  return (
    <dl className={`dl-horizontal col-sm-12 ${className}`}>
      <SummaryComponent resource={props.resource} />
    </dl>
  );
};
