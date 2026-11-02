import { Progress, type ProgressSize, type ProgressVariant } from 'waldur-ui';

import { formatUsageValue } from '@/core/formatNumber';
import { isEmptyValue } from '@/core/isEmptyValue';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

import { formatProp, FormattedProperty } from './types';

type MeterFormatUnit =
  'raw' | 'fileSize' | 'percent' | 'number' | ((val: number) => string);

interface MeterThresholds {
  warning?: number;
  danger?: number;
}

export interface MeterFormatOptions {
  /** Unit label printed beside numbers (e.g. 'cores', 'MiB', 'tickets') */
  unit?: string;
  /** Unit formatting rule for values */
  format?: MeterFormatUnit;
  /** Number of fraction digits for decimal numbers/percentages */
  fractionDigits?: number;
  /** Display style: 'bar' (stacked with progress bar), 'inline' (horizontal), or 'text' */
  display?: 'bar' | 'inline' | 'text';
  /** Size of the progress bar (defaults to 'xs') */
  size?: ProgressSize;
  /** Visual variant or dynamic threshold configuration */
  variant?: ProgressVariant | MeterThresholds;
  /** Invert threshold logic: 'positive' means higher is better (e.g. hit ratio) */
  polarity?: 'positive' | 'negative';
  /** Show computed percentage alongside numbers */
  showPercent?: boolean;
  /** Show fraction 'value / max' (defaults to true if max is supplied) */
  showFraction?: boolean;
  /** Text when max is null or -1 (defaults to translate('Unlimited')) */
  unlimitedText?: string;
  /** Accessible label for the progress bar */
  label?: string;
}

export function formatMeterValue(
  value: number | string | null | undefined,
  options?: MeterFormatOptions,
): FormattedProperty | null;
export function formatMeterValue(
  value: number | string | null | undefined,
  max: number | string | null | undefined,
  options?: MeterFormatOptions,
): FormattedProperty | null;
export function formatMeterValue(
  value: number | string | null | undefined,
  maxOrOptions?: number | string | null | undefined | MeterFormatOptions,
  maybeOptions?: MeterFormatOptions,
): FormattedProperty | null {
  if (isEmptyValue(value)) {
    return null;
  }

  const current = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (Number.isNaN(current)) {
    return null;
  }

  let max: number | string | null | undefined = undefined;
  let options: MeterFormatOptions = {};

  if (
    typeof maxOrOptions === 'object' &&
    maxOrOptions !== null &&
    !Array.isArray(maxOrOptions)
  ) {
    options = maxOrOptions as MeterFormatOptions;
  } else {
    max = maxOrOptions as number | string | null | undefined;
    options = maybeOptions ?? {};
  }

  const {
    unit,
    format = 'number',
    display = 'bar',
    size = 'xs',
    polarity = 'negative',
    showPercent,
    showFraction = true,
    unlimitedText = translate('Unlimited'),
    label,
  } = options;

  const isUnlimited = max === -1 || max === '-1';
  const hasMax = !isEmptyValue(max) && !isUnlimited;
  const total = hasMax
    ? typeof max === 'string'
      ? parseFloat(max)
      : Number(max)
    : null;

  if (hasMax && (total === null || Number.isNaN(total))) {
    return null;
  }

  // Calculate percentage
  let percent: number | null = null;
  if (hasMax && total !== null && total > 0) {
    percent = Math.min(Math.max((current / total) * 100, 0), 100);
  } else if (format === 'percent' && !hasMax) {
    percent = Math.min(Math.max(current, 0), 100);
  }

  // Resolve progress variant
  let variant: ProgressVariant = 'primary';
  if (typeof options.variant === 'string') {
    variant = options.variant;
  } else if (typeof options.variant === 'object' && options.variant !== null) {
    const { warning = 75, danger = 90 } = options.variant;
    if (percent !== null) {
      if (polarity === 'positive') {
        variant =
          percent < danger
            ? 'danger'
            : percent < warning
              ? 'warning'
              : 'success';
      } else {
        variant =
          percent >= danger
            ? 'danger'
            : percent >= warning
              ? 'warning'
              : 'primary';
      }
    }
  } else if (percent !== null) {
    variant = percent > 90 ? 'danger' : percent > 75 ? 'warning' : 'primary';
  }

  // Value formatting
  const formatVal = (n: number) => {
    if (typeof format === 'function') return format(n);
    if (format === 'fileSize') return formatFilesize(n);
    if (format === 'percent') {
      const decimals = options.fractionDigits ?? (n % 1 === 0 ? 0 : 1);
      return `${n.toFixed(decimals)}%`;
    }
    return formatUsageValue(n);
  };

  const valStr = formatVal(current);
  const totalStr =
    total !== null ? formatVal(total) : isUnlimited ? unlimitedText : undefined;
  const unitSuffix = unit ? ` ${unit}` : '';
  const pctStr =
    percent !== null
      ? `${percent % 1 === 0 ? percent : percent.toFixed(1)}%`
      : '';

  // Generate copyable text
  let copyText = '';
  if (showFraction && totalStr !== undefined) {
    if (isUnlimited) {
      copyText = `${valStr}${unitSuffix} / ${totalStr}`;
    } else {
      copyText = `${valStr} / ${totalStr}${unitSuffix}`;
    }
    if (showPercent && percent !== null) {
      copyText += ` (${pctStr})`;
    }
  } else {
    copyText = `${valStr}${unitSuffix}`;
    if (showPercent && percent !== null && format !== 'percent') {
      copyText += ` (${pctStr})`;
    }
  }

  const showBar = display !== 'text' && percent !== null;

  if (display === 'inline') {
    const node = (
      <div className="flex items-center gap-2 tabular-nums">
        {showBar && (
          <div className="w-16 shrink-0">
            <Progress
              value={percent!}
              variant={variant}
              size={size}
              label={label ?? (unit ? `${unit} progress` : undefined)}
            />
          </div>
        )}
        <span className="text-sm">
          <span className="font-medium text-primary">{valStr}</span>
          {showFraction && totalStr !== undefined && (
            <>
              <span className="text-quaternary" aria-hidden="true">
                {' '}
                /{' '}
              </span>
              <span className="sr-only"> {translate('out of')} </span>
              <span className="text-secondary">{totalStr}</span>
            </>
          )}
          {unit && <span className="text-quaternary ms-1">{unit}</span>}
          {showPercent && percent !== null && format !== 'percent' && (
            <span className="text-xs text-quaternary font-medium ms-1">
              ({pctStr})
            </span>
          )}
        </span>
      </div>
    );
    return formatProp(node, copyText);
  }

  const node = (
    <div className="flex flex-col gap-1 w-full max-w-xs">
      <div className="flex items-center justify-between text-sm tabular-nums">
        <span>
          <span className="font-medium text-primary">{valStr}</span>
          {showFraction && totalStr !== undefined && (
            <>
              <span className="text-quaternary" aria-hidden="true">
                {' '}
                /{' '}
              </span>
              <span className="sr-only"> {translate('out of')} </span>
              <span className="text-secondary">{totalStr}</span>
            </>
          )}
          {unit && <span className="text-quaternary ms-1">{unit}</span>}
        </span>
        {showPercent && percent !== null && format !== 'percent' && (
          <span className="text-xs text-quaternary font-medium">
            ({pctStr})
          </span>
        )}
      </div>
      {showBar && (
        <Progress
          value={percent!}
          variant={variant}
          size={size}
          label={label ?? (unit ? `${unit} progress` : undefined)}
        />
      )}
    </div>
  );

  return formatProp(node, copyText);
}
