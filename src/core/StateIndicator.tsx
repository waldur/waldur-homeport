import { capitalize, lowerCase } from 'lodash-es';
import { FunctionComponent } from 'react';

import { Badge, BadgeShape, BadgeTone, BadgeVariant } from 'waldur-ui';

import { LoadingSpinnerSimple } from './LoadingSpinner';

export interface StateIndicatorProps {
  label: string;
  tooltip?: string;
  variant: BadgeVariant;
  active?: boolean;
  shape?: BadgeShape;
  tone?: BadgeTone;
  hasBullet?: boolean;
  size?: 'sm' | 'lg';
  'data-testid'?: string;
}

/** Normalize backend state strings — e.g. "ACTIVE" → "Active", "OK" stays "OK" */
const normalizeLabel = (label: string): string => {
  if (!label) return label;
  // Short all-caps acronyms (2-3 chars) stay as-is: OK, N/A
  if (label.length <= 3 && label === label.toUpperCase()) return label;
  // If the label is all uppercase, convert to title case
  if (label === label.toUpperCase()) return capitalize(lowerCase(label));
  return label;
};

export const StateIndicator: FunctionComponent<StateIndicatorProps> = ({
  active,
  ...props
}) => (
  <Badge
    rightIcon={
      active ? (
        <LoadingSpinnerSimple
          className={
            props.tone === 'light' || props.tone === 'outline'
              ? `text-${props.variant}`
              : `badge-${props.variant}`
          }
        />
      ) : undefined
    }
    {...props}
    data-testid={props['data-testid'] || 'default-state-indicator'}
  >
    {normalizeLabel(props.label)}
  </Badge>
);
