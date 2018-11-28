import * as classNames from 'classnames';
import * as React from 'react';

export type StateVariant = 'primary' | 'plain' | 'danger' | 'warning' | 'success' | 'info';

interface StateIndicatorProps {
  label: React.ReactNode;
  variant: StateVariant;
  striped?: boolean;
  active?: boolean;
}

export const StateIndicator = (props: StateIndicatorProps) => (
  <div className={`progress state-indicator m-b-none`}>
    <span className={classNames(
      'progress-bar',
      `progress-bar-${props.variant}`,
      'p-w-sm',
      'full-width',
      {'progress-bar-striped': props.striped || props.active},
      {active: props.active}
      )}>
      {props.label}
    </span>
  </div>
);
