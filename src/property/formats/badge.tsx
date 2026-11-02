import { ReactNode } from 'react';

import {
  Badge,
  type BadgeProps,
  type BadgeShape,
  type BadgeTone,
  type BadgeVariant,
} from 'waldur-ui';

import { isEmptyValue } from '@/core/isEmptyValue';

import { formatProp, FormattedProperty } from './types';

export interface BadgeFormatOptions {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  shape?: BadgeShape;
  size?: BadgeProps['size'];
  className?: string;
}

export interface BadgeListFormatOptions extends BadgeFormatOptions {
  limit?: number;
  separator?: string;
}

export const formatBadgeValue = (
  value: ReactNode,
  options: BadgeFormatOptions = {},
): FormattedProperty | null => {
  if (isEmptyValue(value)) {
    return null;
  }

  const text =
    typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  const node = (
    <Badge
      variant={options.variant ?? 'neutral'}
      size={options.size ?? 'sm'}
      shape={options.shape ?? 'pill'}
      tone={options.tone ?? 'outline'}
      className={options.className}
    >
      {value}
    </Badge>
  );

  return formatProp(node, text);
};

export const formatBadgeListValue = (
  values: unknown[] | null | undefined,
  options: BadgeListFormatOptions = {},
): FormattedProperty | null => {
  if (isEmptyValue(values) || !Array.isArray(values) || values.length === 0) {
    return null;
  }

  const separator = options.separator ?? ', ';
  const limit = options.limit ?? values.length;
  const visible = values.slice(0, limit);
  const remaining = values.length - limit;

  const text = values
    .filter((v) => !isEmptyValue(v))
    .map((v) => String(v))
    .join(separator);

  const node = (
    <span className="flex flex-wrap items-center gap-1.5">
      {visible.map((item, index) => (
        <Badge
          key={index}
          variant={options.variant ?? 'neutral'}
          size={options.size ?? 'sm'}
          shape={options.shape ?? 'pill'}
          tone={options.tone ?? 'outline'}
        >
          {String(item)}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge
          variant="neutral"
          size={options.size ?? 'sm'}
          shape={options.shape ?? 'pill'}
          tone="outline"
        >
          +{remaining}
        </Badge>
      )}
    </span>
  );

  return formatProp(node, text);
};
