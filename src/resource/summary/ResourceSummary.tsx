import { FunctionComponent } from 'react';

import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { ResourceSummaryBase } from './ResourceSummaryBase';

interface ResourceSummaryProps {
  resource: any;
  hasMultiSelect?: boolean;
}

export const ResourceSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  const CustomSummaryComponent = ResourceSummaryRegistry.getCustom(
    props.resource.resource_type,
  );
  if (CustomSummaryComponent) {
    return <CustomSummaryComponent resource={props.resource} />;
  }

  const SummaryComponent = ResourceSummaryRegistry.get(
    props.resource.resource_type,
  );
  return (
    <ExpandableContainer hasMultiSelect={props.hasMultiSelect} asTable>
      <ResourceSummaryBase resource={props.resource} />
      {SummaryComponent && <SummaryComponent resource={props.resource} />}
    </ExpandableContainer>
  );
};
