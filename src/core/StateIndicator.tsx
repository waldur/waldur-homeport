import { FunctionComponent } from 'react';
import { Variant } from 'react-bootstrap/types';

import { Badge } from './Badge';
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

export const StateIndicator: FunctionComponent<StateIndicatorProps> = ({
  active,
  ...props
}) => (
  <Badge {...props}>
    {props.label.toUpperCase()}{' '}
    {active && (
      <LoadingSpinnerIcon
        className={
          (props.light || props.outline ? 'text-' : 'badge-') + props.variant
        }
      />
    )}
  </Badge>
);
