import { capitalize, lowerCase } from 'es-toolkit/compat';
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
      // The spinner takes the badge's own text colour, whatever the variant
      // and tone: the solid label colour (white, or dark on the light dark-mode
      // info and neutral fills), the variant colour on light and outline ones
      // (brand for primary and secondary).
      active ? <LoadingSpinnerSimple className="text-current" /> : undefined
    }
    {...props}
    data-testid={props['data-testid'] || 'default-state-indicator'}
  >
    {normalizeLabel(props.label)}
  </Badge>
);
