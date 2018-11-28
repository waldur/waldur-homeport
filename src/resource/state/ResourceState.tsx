import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { StateIndicator } from '@waldur/offering/StateIndicator';
import { Resource } from '@waldur/resource/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { StateIndicator as StateIndicatorType } from './types';
import { getResourceState } from './utils';

interface ResourceStateProps extends TranslateProps {
  resource: Resource;
}

export const ResourceStateIndicator = (props: StateIndicatorType) => (
  <Tooltip label={props.tooltip} id="resourceState">
    <StateIndicator
      label={props.label.toUpperCase()}
      variant={props.variant}
      active={props.active}
    />
  </Tooltip>
);

// TODO: remove extra check after resources list is migrated to ReactJS
export const PureResourceState = (props: ResourceStateProps) => props.resource ? (
  <ResourceStateIndicator {...getResourceState(props.resource, props.translate)}/>
) : null;

export const ResourceState = withTranslation(PureResourceState);

export default connectAngularComponent(ResourceState, ['resource']);
