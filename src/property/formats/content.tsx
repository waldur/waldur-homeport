import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';

import { BaseButton, CopyableValue } from 'waldur-ui';

import { FormattedHtml } from '@/core/FormattedHtml';
import { isEmptyValue } from '@/core/isEmptyValue';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { TruncatedDescription } from '@/core/TruncatedDescription';
import { translate } from '@/i18n';

import { formatProp, FormattedProperty } from './types';

type Text = string | null | undefined;

export interface RichTextFormatOptions {
  /** How the text is written. Defaults to `plain`. */
  format?: 'plain' | 'markdown' | 'html';
  /** Plain text only: cut at this many characters, with "Show more". */
  truncate?: number;
}

/** Prose: a description, a message, a comment. */
export const formatRichTextValue = (
  value: Text,
  options: RichTextFormatOptions = {},
): FormattedProperty | null => {
  if (isEmptyValue(value) || value.trim() === '') {
    return null;
  }
  const { format = 'plain', truncate } = options;
  const node =
    format === 'html' ? (
      <FormattedHtml html={value} />
    ) : format === 'markdown' ? (
      <SafeMarkdown text={value} />
    ) : truncate ? (
      <TruncatedDescription text={value} max={truncate} />
    ) : (
      <span className="whitespace-pre-wrap">{value}</span>
    );
  const text = format === 'plain' ? value : value;
  return formatProp(node, text);
};

export interface EnumFormatOptions {
  /** The label of each value. */
  labels?: Record<string, string>;
  /**
   * The same, as the `{ value, label }` list a select takes — pass the
   * field's own choices, so the form and the read-only row cannot disagree.
   */
  options?: readonly { value: string | number; label: string }[];
}

/** The value's label; an unlisted value shows as it is. */
const enumLabel = (
  value: string | number,
  { labels, options }: EnumFormatOptions,
) =>
  labels?.[value] ??
  options?.find((option) => option.value === value)?.label ??
  String(value);

/** One of a fixed set of values, read as its label. */
export const formatEnumValue = (
  value: string | number | null | undefined,
  options: EnumFormatOptions = {},
): FormattedProperty | null => {
  if (isEmptyValue(value)) {
    return null;
  }
  const text = enumLabel(value, options);
  return formatProp(text, text);
};

/**
 * A secret shown masked, with a button to reveal it. Its copy icon copies the
 * secret itself, so copying needs no revealing first; reveal is for retyping
 * it by hand.
 */
export const MaskedValue: FC<{ value: string; name?: string }> = ({
  value,
  name,
}) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <CopyableValue value={value} name={name}>
      <span className="flex items-center">
        <span className="wrap-anywhere">
          {revealed ? value : '•'.repeat(12)}
        </span>
        <BaseButton
          iconNode={
            revealed ? (
              <EyeSlashIcon weight="bold" />
            ) : (
              <EyeIcon weight="bold" />
            )
          }
          tooltip={revealed ? translate('Hide') : translate('Reveal')}
          onClick={() => setRevealed(!revealed)}
          variant="text-secondary"
          size="sm"
          className="shrink-0"
        />
      </span>
    </CopyableValue>
  );
};

/** A password, token or key. It copies itself, so it takes no `hasCopy`. */
export const formatSecretValue = (value: Text): FormattedProperty | null => {
  if (isEmptyValue(value)) {
    return null;
  }
  return formatProp(<MaskedValue value={value} />, value);
};

export interface JsonFormatOptions {
  /** One line in `<code>` instead of an indented block. */
  compact?: boolean;
}

const jsonText = (value: unknown, compact?: boolean) =>
  JSON.stringify(value, null, compact ? undefined : 2);

/** Structured data shown as it is: a payload, a response, attributes. */
export const formatJsonValue = (
  value: unknown,
  options: JsonFormatOptions = {},
): FormattedProperty | null => {
  if (
    isEmptyValue(value) ||
    (typeof value === 'object' && Object.keys(value as object).length === 0)
  ) {
    return null;
  }
  const text = jsonText(value);
  const node = options.compact ? (
    <code className="wrap-anywhere">{jsonText(value, true)}</code>
  ) : (
    <pre className="mb-0 text-xs whitespace-pre-wrap">{text}</pre>
  );
  return formatProp(node, text);
};
