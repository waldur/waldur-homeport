import * as React from 'react';

import { StateIndicator, StateVariant } from '@waldur/core/StateIndicator';
import { connectAngularComponent } from '@waldur/store/connect';

export type MonitoringStateType = 'Unregistered' | 'Erred' | 'Warning' | 'OK';

const LABEL_CLASSES: {[key in MonitoringStateType]: StateVariant} = {
  Unregistered: 'plain',
  Erred: 'danger',
  Warning: 'warning',
  OK: 'info',
};

interface MonitoringStateIndicatorProps {
  resource: {
    monitoring_state: MonitoringStateType;
  };
}

export const MonitoringState = (props: MonitoringStateIndicatorProps) => (
  <StateIndicator
    label={props.resource.monitoring_state}
    variant={LABEL_CLASSES[props.resource.monitoring_state] || 'info'}
  />
);

export default connectAngularComponent(MonitoringState, ['resource']);
