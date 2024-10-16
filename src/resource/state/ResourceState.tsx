import { FunctionComponent } from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { Resource } from '@waldur/resource/types';

import { getResourceState } from './utils';

interface ResourceStateProps {
  resource: Resource;
  roundless?: boolean;
}

export const ResourceState: FunctionComponent<ResourceStateProps> = (props) =>
  props.resource?.resource_type ? (
    <StateIndicator
      {...getResourceState(props.resource)}
      roundless={props.roundless}
      outline
      pill
    />
  ) : null;
