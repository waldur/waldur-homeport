import * as React from 'react';

import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { connectAngularComponent } from '@waldur/store/connect';

import { getLabel, isActive, getVariant } from './state-builder/StateIndicatorBuilder';

interface RequestStateIndicatorProps {
  model: {
    state: ManagementRequestState;
  };
}

export const RequestStateIndicator = (props: RequestStateIndicatorProps) => (
  <StateIndicator
    label={getLabel(props.model.state)}
    variant={getVariant(props.model.state)}
    active={isActive(props.model.state)}
  />
);

export default connectAngularComponent(RequestStateIndicator, ['model']);
