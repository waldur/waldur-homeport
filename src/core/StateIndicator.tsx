import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Badge } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/types';

import { Tip } from '@waldur/core/Tooltip';

import { LoadingSpinnerIcon } from './LoadingSpinner';

export interface StateIndicatorProps {
  label: string;
  tooltip?: string;
  variant: Variant;
  active?: boolean;
  roundless?: boolean;
  light?: boolean;
  outline?: boolean;
  pill?: boolean;
  hasBullet?: boolean;
  size?: 'sm' | 'lg';
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
    <Badge
      bg={!(props.light || props.outline) ? props.variant : null}
      className={classNames([
        'badge-' +
          (props.outline ? 'outline-' : props.light ? 'light-' : '') +
          props.variant,
        props.size && `badge-${props.size}`,
        props.roundless && 'rounded-0',
        props.pill && 'badge-pill',
      ])}
    >
      {props.hasBullet && (
        <span
          className={`bullet bullet-dot bg-${props.light || props.outline ? props.variant : 'white'} me-2 h-5px w-5px align-middle`}
        />
      )}
      {props.label.toUpperCase()}{' '}
      {props.active && (
        <LoadingSpinnerIcon
          className={
            (props.light || props.outline ? 'text-' : 'badge-') + props.variant
          }
        />
      )}
    </Badge>,
  );
