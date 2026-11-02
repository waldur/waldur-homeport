import { ReactNode } from 'react';

import { isFormattedProperty } from 'waldur-ui';

import { isEmptyValue } from '@/core/isEmptyValue';

import { formatProp, FormattedProperty } from './types';

export interface AnnotatedFormatOptions {
  subtext?: ReactNode;
  hint?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const formatAnnotatedValue = (
  primary: unknown,
  options: AnnotatedFormatOptions = {},
): FormattedProperty | null => {
  if (isEmptyValue(primary)) {
    return null;
  }

  const primaryText = isFormattedProperty(primary)
    ? primary.text
    : String(primary);
  const primaryNode = isFormattedProperty(primary)
    ? primary.node
    : (primary as ReactNode);

  const subText =
    typeof options.subtext === 'string' || typeof options.subtext === 'number'
      ? String(options.subtext)
      : '';
  const hintText =
    typeof options.hint === 'string' || typeof options.hint === 'number'
      ? ` (${options.hint})`
      : '';
  const copyText =
    `${primaryText}${hintText}${subText ? ` — ${subText}` : ''}`.trim();

  const node = (
    <div>
      <div className="inline-flex items-baseline gap-1.5 flex-wrap">
        {options.prefix}
        <span className="font-medium text-primary">{primaryNode}</span>
        {options.suffix}
        {options.hint && (
          <span className="text-quaternary text-xs">({options.hint})</span>
        )}
      </div>
      {options.subtext && (
        <div className="text-xs text-quaternary mt-0.5">{options.subtext}</div>
      )}
    </div>
  );

  return formatProp(node, copyText);
};
