import { Badge, BadgeProps, BadgeVariant } from 'waldur-ui';

import { isEmptyValue } from '@/core/isEmptyValue';

import { formatProp, FormattedProperty } from './types';

interface StateLook {
  label: string;
  variant?: BadgeVariant;
}

export interface StateFormatOptions {
  /**
   * How each state reads, by value. A state missing from the map shows its
   * raw value on a neutral badge, so a new backend state is still visible.
   */
  states: Record<string, StateLook>;
  /** The badge's size. */
  size?: BadgeProps['size'];
  /**
   * A `data-testid` on the badge itself, for a test that reads the state
   * alone (the row's own `data-testid` marks the label too).
   */
  testId?: string;
}

const lookOf = (value: string, states: Record<string, StateLook>) =>
  states[value] ?? { label: value, variant: 'neutral' as BadgeVariant };

/** A state or status, as an outlined pill. */
export const formatStateValue = (
  value: string | null | undefined,
  options: StateFormatOptions,
): FormattedProperty | null => {
  if (isEmptyValue(value)) {
    return null;
  }
  const { states, size, testId } = options;
  const { label, variant = 'neutral' } = lookOf(String(value), states);
  const node = (
    <Badge
      variant={variant}
      size={size}
      shape="pill"
      tone="outline"
      data-testid={testId}
    >
      {label}
    </Badge>
  );
  return formatProp(node, label);
};
