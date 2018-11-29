import * as React from 'react';

import { StateIndicator, StateVariant } from '@waldur/core/StateIndicator';
import { connectAngularComponent } from '@waldur/store/connect';

import { RequestState } from './types';

interface ExpertRequestStateProps {
  model: {
    state: RequestState;
  };
}

type Mapping = {[key in RequestState]: StateVariant};

const LabelClasses: Mapping = {
  Active: 'info',
  Pending: 'warning',
  Cancelled: 'danger',
  Finished: 'success',
};

const getLabelClass = (state: RequestState): StateVariant => LabelClasses[state] || 'info';

const getLabel = (state: RequestState): string => {
  if (state === 'Pending') {
    return 'Waiting for proposals';
  }
  return state;
};

export const ExpertRequestState = (props: ExpertRequestStateProps) => (
  <StateIndicator
    variant={getLabelClass(props.model.state)}
    label={getLabel(props.model.state)}
  />
);

export default connectAngularComponent(ExpertRequestState, ['model']);
