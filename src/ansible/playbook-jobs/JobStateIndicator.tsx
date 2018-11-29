import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

export type JobStateType = 'Scheduled' | 'Executing' | 'Erred' | 'OK';

interface JobStateIndicatorProps {
  model: {
    state: JobStateType;
  };
}

const getLabel = (state: JobStateType) => ({
  'OK': translate('OK'),
  'Erred': translate('Erred'),
  'Creation Scheduled': translate('Execution Scheduled'),
  'Creating': translate('Executing'),
}[state]);

export const JobStateIndicator = (props: JobStateIndicatorProps) => (
  <StateIndicator
    label={getLabel(props.model.state)}
    variant={props.model.state === 'Erred' ? 'danger' : 'info'}
    active={props.model.state === 'Scheduled' || props.model.state === 'Executing'}
  />
);

export default connectAngularComponent(JobStateIndicator, ['model']);
