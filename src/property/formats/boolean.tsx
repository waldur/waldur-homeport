import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';

import { Badge, BadgeProps, BadgeVariant } from 'waldur-ui';

import { translate } from '@/i18n';

import { formatProp, FormattedProperty } from './types';

/** A named pair, or the pair itself: `[translate('Complete'), translate('Incomplete')]`. */
type BooleanWording =
  'yesNo' | 'enabled' | 'active' | readonly [string, string];

const BOOLEAN_WORDS: Record<
  Exclude<BooleanWording, readonly [string, string]>,
  () => [string, string]
> = {
  yesNo: () => [translate('Yes'), translate('No')],
  enabled: () => [translate('Enabled'), translate('Disabled')],
  active: () => [translate('Active'), translate('Inactive')],
};

export interface BooleanFormatOptions {
  /** The pair of words the value reads as. Defaults to `yesNo`. */
  wording?: BooleanWording;
  /**
   * `text` (default) is the word; `badge` an outlined pill, success or
   * neutral; `icon` a check or a cross, with the word for screen readers.
   */
  display?: 'text' | 'badge' | 'icon';
  /** Paint `true` as success and `false` as muted. Text only. */
  colored?: boolean;
  /**
   * Badge display: the pair of variants `true` and `false` wear. Defaults to
   * success and neutral. Named in the plural because `variant` is the row's
   * own prop.
   */
  variants?: readonly [BadgeVariant, BadgeVariant];
  /** Badge display: the badge's size. */
  size?: BadgeProps['size'];
}

const wordFor = (value: boolean, wording: BooleanWording = 'yesNo') =>
  (typeof wording === 'string' ? BOOLEAN_WORDS[wording]() : wording)[
    value ? 0 : 1
  ];

export const formatBooleanValue = (
  value: boolean | null | undefined,
  options: BooleanFormatOptions = {},
): FormattedProperty | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const { wording, display = 'text', colored, variants, size } = options;
  const word = wordFor(value, wording);
  let node: ReactNode;
  if (display === 'badge') {
    const [whenTrue, whenFalse] = variants ?? ['success', 'neutral'];
    node = (
      <Badge
        variant={value ? whenTrue : whenFalse}
        size={size}
        shape="pill"
        tone="outline"
      >
        {word}
      </Badge>
    );
  } else if (display === 'icon') {
    node = (
      <span className={value ? 'text-success' : 'text-quaternary'}>
        {value ? (
          <CheckIcon weight="bold" aria-hidden />
        ) : (
          <XIcon weight="bold" aria-hidden />
        )}
        <span className="sr-only">{word}</span>
      </span>
    );
  } else {
    node = colored ? (
      <span className={value ? 'text-success' : 'text-quaternary'}>{word}</span>
    ) : (
      word
    );
  }
  return formatProp(node, word);
};
