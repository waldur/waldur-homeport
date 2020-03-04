import * as React from 'react';

import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';
import { connectAngularComponent } from '@waldur/store/connect';

import './resource-summary.scss';
import { ResourceSummaryBase } from './ResourceSummaryBase';

interface ResourceSummaryProps {
  resource: any;
}

export const ResourceSummary = (props: ResourceSummaryProps) => {
  const SummaryComponent =
    ResourceSummaryRegistry.get(props.resource.resource_type) ||
    ResourceSummaryBase;
  return (
    <dl className="dl-horizontal resource-details-table col-sm-12">
      <SummaryComponent resource={props.resource} />
    </dl>
  );
};

export default connectAngularComponent(ResourceSummary, ['resource']);
