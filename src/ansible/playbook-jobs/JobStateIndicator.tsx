import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { connectAngularComponent } from '@waldur/store/connect';

export type JobStateType = 'Scheduled' | 'Executing' | 'Erred' | 'OK';

interface JobStateIndicatorProps {
  model: {
    state: JobStateType;
  };
}

export const JobStateIndicator = (props: JobStateIndicatorProps) => (
  <StateIndicator
    label={props.model.state}
    variant={props.model.state === 'Erred' ? 'danger' : 'info'}
    active={props.model.state === 'Scheduled' || props.model.state === 'Executing'}
  />
);

export default connectAngularComponent(JobStateIndicator, ['model']);
