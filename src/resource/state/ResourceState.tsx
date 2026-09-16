import { FunctionComponent } from 'react';

import { BadgeShape } from 'waldur-ui';

import { StateIndicator } from '@/core/StateIndicator';
import { Resource } from '@/resource/types';

import { getResourceState } from './utils';

interface ResourceStateProps {
  resource: Resource;
  shape?: BadgeShape;
}

export const ResourceState: FunctionComponent<ResourceStateProps> = (props) =>
  props.resource?.resource_type ? (
    <StateIndicator
      {...getResourceState(props.resource)}
      shape={props.shape || 'pill'}
      tone="outline"
    />
  ) : null;
