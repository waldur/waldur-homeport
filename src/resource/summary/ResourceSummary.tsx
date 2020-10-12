import * as React from 'react';

import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';

import { ResourceSummaryBase } from './ResourceSummaryBase';
import './resource-summary.scss';

interface ResourceSummaryProps {
  resource: any;
}

export const ResourceSummary = (props: ResourceSummaryProps) => {
  const { component: SummaryComponent = ResourceSummaryBase, className } =
    ResourceSummaryRegistry.get(props.resource.resource_type) || {};
  return (
    <dl className={`dl-horizontal col-sm-12 ${className}`}>
      <SummaryComponent resource={props.resource} />
    </dl>
  );
};
