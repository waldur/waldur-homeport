import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';

export type StateVariant =
  | 'primary'
  | 'plain'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info';

export interface StateIndicatorProps {
  label: string;
  tooltip?: string;
  variant: StateVariant;
  striped?: boolean;
  active?: boolean;
}

const wrapTooltip = (label, children) =>
  label ? (
    <Tip label={label} id="state-indicator">
      {children}
    </Tip>
  ) : (
    children
  );

export const StateIndicator: FunctionComponent<StateIndicatorProps> = (props) =>
  wrapTooltip(
    props.tooltip,
    <span
      className={classNames('badge fs-8 fw-bolder', `badge-${props.variant}`)}
    >
      {props.label.toUpperCase()}
    </span>,
  );
