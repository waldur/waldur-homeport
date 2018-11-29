import * as classNames from 'classnames';
import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

export type StateVariant = 'primary' | 'plain' | 'danger' | 'warning' | 'success' | 'info';

export interface StateIndicatorProps {
  label: string;
  tooltip?: string;
  variant: StateVariant;
  striped?: boolean;
  active?: boolean;
}

const wrapTooltip = (label, children) =>
  label ? <Tooltip label={label} id="state-indicator">{children}</Tooltip> : children;

export const StateIndicator = (props: StateIndicatorProps) => wrapTooltip(props.tooltip, (
  <div className={`progress state-indicator m-b-none`}>
    <span className={classNames(
      'progress-bar',
      `progress-bar-${props.variant}`,
      'p-w-sm',
      'full-width',
      {'progress-bar-striped': props.striped || props.active},
      {active: props.active}
      )}>
      {props.label.toUpperCase()}
    </span>
  </div>
));
