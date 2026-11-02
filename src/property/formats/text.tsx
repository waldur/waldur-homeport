import { MiddleTruncate } from 'waldur-ui';

import { isEmptyValue } from '@/core/isEmptyValue';

import { formatProp, FormattedProperty } from './types';

export type TextValue = string | number | null | undefined;

const isBlank = (value: TextValue) =>
  isEmptyValue(value) || (typeof value === 'string' && value.trim() === '');

// Literal classes: Tailwind generates only what it can read in the source.
const LINE_CLAMP = { 1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3' };

export interface TextFormatOptions {
  /** Clamp the text to this many lines. */
  lines?: 1 | 2 | 3;
}

/** Plain text. A blank string reads as missing. */
export const formatTextValue = (
  value: TextValue,
  options: TextFormatOptions = {},
): FormattedProperty | null => {
  if (isBlank(value)) {
    return null;
  }
  const text = String(value);
  const node = options.lines ? (
    <span className={LINE_CLAMP[options.lines]}>{text}</span>
  ) : (
    text
  );
  return formatProp(node, text);
};

export interface CodeFormatOptions {
  /** Keep the start and end of a long identifier, dropping the middle. */
  truncate?: 'middle';
}

/** An identifier, key or path: monospace, and copied as it is. */
export const formatCodeValue = (
  value: TextValue,
  options: CodeFormatOptions = {},
): FormattedProperty | null => {
  if (isBlank(value)) {
    return null;
  }
  const text = String(value);
  const node = (
    <code>
      {options.truncate === 'middle' ? <MiddleTruncate text={text} /> : text}
    </code>
  );
  return formatProp(node, text);
};
