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
  pill?: boolean;
  hasBullet?: boolean;
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
      bg={!props.light ? props.variant : null}
      className={classNames('fs-8 fw-bolder lh-base', [
        props.roundless && 'rounded-0',
        'badge-' + (props.light ? 'light-' : '') + props.variant,
        props.pill && 'badge-pill',
      ])}
    >
      {props.hasBullet && (
        <span
          className={`bullet bullet-dot bg-${props.light ? props.variant : 'white'} me-2 h-5px w-5px align-middle`}
        />
      )}
      {props.label.toUpperCase()}{' '}
      {props.active && (
        <LoadingSpinnerIcon
          className={(props.light ? 'text-' : 'badge-') + props.variant}
        />
      )}
    </Badge>,
  );
