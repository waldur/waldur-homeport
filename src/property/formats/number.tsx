import { defaultCurrency } from '@/core/formatCurrency';
import { formatUsageValue } from '@/core/formatNumber';
import { isEmptyValue } from '@/core/isEmptyValue';
import { translate } from '@/i18n';

import { formatProp, FormattedProperty } from './types';

// API decimals arrive as strings ("12.50"), so both read as numbers.
export type NumberValue = number | string | null | undefined;

const toNumber = (value: NumberValue) =>
  typeof value === 'string' ? parseFloat(value) : (value as number);

const isMissingNumber = (value: NumberValue) =>
  isEmptyValue(value) || Number.isNaN(toNumber(value));

export interface NumberFormatOptions {
  /** Written after the number: `GB`, `cores`, `days`. */
  unit?: string;
  /** At most this many decimals. */
  fractionDigits?: number;
  /**
   * What a missing number means, when it means something: a counter an
   * endpoint leaves out when idle is `0`, not unknown.
   */
  missingAs?: number;
  /** The value that means no limit (often `-1`); it reads "Unlimited". */
  unlimited?: number;
}

const formatNumberText = (value: NumberValue, options: NumberFormatOptions) => {
  const num = isMissingNumber(value) ? options.missingAs : toNumber(value);
  if (options.unlimited !== undefined && num === options.unlimited) {
    return translate('Unlimited');
  }
  const text = formatUsageValue(num, false, options.fractionDigits);
  return options.unit ? `${text} ${options.unit}` : text;
};

/** A count or quantity in the user's locale, with an optional unit. */
export const formatNumberValue = (
  value: NumberValue,
  options: NumberFormatOptions = {},
): FormattedProperty | null => {
  if (options.missingAs === undefined && isMissingNumber(value)) {
    return null;
  }
  const text = formatNumberText(value, options);
  const node = (
    <data
      value={isMissingNumber(value) ? options.missingAs : toNumber(value)}
      className="tabular-nums"
    >
      {text}
    </data>
  );
  return formatProp(node, text);
};

export type CountFormatOptions = Omit<NumberFormatOptions, 'missingAs'>;

/** A count or quantity where null or undefined means 0, not unknown. */
export const formatCountValue = (
  value: NumberValue,
  options: CountFormatOptions = {},
): FormattedProperty => {
  return formatNumberValue(value, { ...options, missingAs: 0 })!;
};

export interface MoneyFormatOptions {
  /** `€1.2k` from 1,000 up, for dense layouts. */
  shorten?: boolean;
  /** Prefix `+` or `-`, for a change or a balance. */
  signed?: boolean;
}

const formatMoneyText = (value: NumberValue, options: MoneyFormatOptions) =>
  defaultCurrency(value, options.shorten, options.signed);

/** An amount in the deployment's currency. */
export const formatCurrencyValue = (
  value: NumberValue,
  options: MoneyFormatOptions = {},
): FormattedProperty | null => {
  if (isMissingNumber(value)) {
    return null;
  }
  const text = formatMoneyText(value, options);
  const node = (
    <data value={toNumber(value)} className="tabular-nums">
      {text}
    </data>
  );
  return formatProp(node, text);
};
