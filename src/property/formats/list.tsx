import { ReactNode } from 'react';

import { Badge, CopyableValue } from 'waldur-ui';

import { isEmptyValue } from '@/core/isEmptyValue';
import { translate } from '@/i18n';

import { formatProp, FormattedProperty } from './types';

export type ListValue = readonly (string | number | null | undefined)[] | null;

export interface ListFormatOptions {
  /**
   * `inline` (default) joins with commas; `stack` puts one item a line;
   * `badges` draws each as a neutral pill.
   */
  display?: 'inline' | 'stack' | 'badges';
  /** Under `stack`, each item copies itself. */
  itemCopy?: boolean;
  /** Show at most this many, then "+N more". */
  max?: number;
}

const itemsOf = (value: ListValue) =>
  (value ?? []).filter((item) => !isEmptyValue(item)).map(String);

const moreLabel = (count: number) =>
  translate('+{count} more', { count: String(count) });

/** Several values of one property: names, tags, addresses. */
export const formatListValue = (
  value: ListValue,
  options: ListFormatOptions = {},
): FormattedProperty | null => {
  const items = itemsOf(value);
  if (items.length === 0) {
    return null;
  }
  const { display = 'inline', itemCopy, max } = options;
  const shown = max ? items.slice(0, max) : items;
  const rest = items.length - shown.length;
  const more = rest > 0 && (
    <span className="text-quaternary">{moreLabel(rest)}</span>
  );
  let node: ReactNode;
  if (display === 'stack') {
    node = (
      <span className="flex flex-col gap-1">
        {shown.map((item) =>
          itemCopy ? (
            <CopyableValue key={item} value={item} />
          ) : (
            <span key={item}>{item}</span>
          ),
        )}
        {more}
      </span>
    );
  } else if (display === 'badges') {
    node = (
      <span className="flex flex-wrap items-center gap-1">
        {shown.map((item) => (
          <Badge key={item} variant="neutral" shape="pill" tone="outline">
            {item}
          </Badge>
        ))}
        {more}
      </span>
    );
  } else {
    node =
      rest > 0 ? (
        <>
          {shown.join(', ')} {more}
        </>
      ) : (
        shown.join(', ')
      );
  }
  const text = items.join(', ');
  return formatProp(node, text);
};
