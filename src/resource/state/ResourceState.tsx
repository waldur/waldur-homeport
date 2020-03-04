import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { Resource } from '@waldur/resource/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { getResourceState } from './utils';

interface ResourceStateProps {
  resource: Resource;
}

// TODO: remove extra check after resources list is migrated to ReactJS
export const ResourceState = (props: ResourceStateProps) =>
  props.resource ? (
    <StateIndicator {...getResourceState(props.resource)} />
  ) : null;

export default connectAngularComponent(ResourceState, ['resource']);
