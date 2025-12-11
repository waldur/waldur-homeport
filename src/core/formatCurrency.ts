import { ENV } from '@waldur/core/config';

export const formatCurrency = (
  value: string | number,
  currency: string,
  fractionSize: number,
  signed?: boolean,
) => {
  if (typeof value === 'string') value = parseFloat(value);
  let sign = '';
  if (signed) {
    sign = value > 0 ? '+' : value < 0 ? '-' : '';
  }
  return `${sign}${currency || ''} ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionSize,
  }).format(signed ? Math.abs(value) : value)}`;
};

const abbreviateNumber = (value: string | number) => {
  if (typeof value === 'string') value = parseFloat(value);
  const suffixes = ['', 'k', 'M', 'B', 'T'];
  let magnitude = 0;

  while (Math.abs(value) >= 1000 && magnitude < suffixes.length - 1) {
    value /= 1000;
    magnitude++;
  }

  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}${suffixes[magnitude]}`;
};

export const defaultCurrency = (
  value,
  shorten = false,
  signed = false,
): string | null | undefined => {
  if (value === undefined || value === null) {
    return value;
  }
  let fractionSize = 2;
  if (typeof value === 'string') value = parseFloat(value);
  if (value !== 0 && Math.abs(value) < 0.05) {
    fractionSize = 3;
  }
  if (value !== 0 && Math.abs(value) < 0.005) {
    fractionSize = 4;
  }

  if (shorten && Number(value) >= 1000) {
    const formattedValue = abbreviateNumber(value);
    return `${ENV.plugins.WALDUR_CORE.CURRENCY_NAME} ${formattedValue}`;
  }
  return formatCurrency(
    value,
    ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
    fractionSize,
    signed,
  );
};
