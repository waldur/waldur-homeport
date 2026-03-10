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
  'data-testid'?: string;
}

export const StateIndicator: FunctionComponent<StateIndicatorProps> = ({
  active,
  ...props
}) => (
  <Badge
    rightIcon={
      active ? (
        <LoadingSpinnerIcon
          className={
            props.light || props.outline
              ? `text-${props.variant}`
              : `badge-${props.variant}`
          }
        />
      ) : undefined
    }
    {...props}
    data-testid={props['data-testid'] || 'default-state-indicator'}
  >
    {props.label}
  </Badge>
);
