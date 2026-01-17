import { ENV } from '@waldur/core/config';

// Check if currency is an ISO 4217 code (3 uppercase letters)
const isIsoCurrencyCode = (currency: string): boolean =>
  /^[A-Z]{3}$/.test(currency);

// Get user's locale from browser, fallback to 'en'
const getUserLocale = (): string => {
  if (typeof navigator !== 'undefined') {
    return navigator.language || 'en';
  }
  return 'en';
};

export const formatCurrency = (
  value: string | number,
  currency: string,
  fractionSize: number,
  signed?: boolean,
) => {
  if (typeof value === 'string') value = parseFloat(value);

  const absoluteValue = signed ? Math.abs(value) : value;
  let sign = '';
  if (signed) {
    sign = value > 0 ? '+' : value < 0 ? '-' : '';
  }

  // Use Intl.NumberFormat with currency style for ISO codes
  if (currency && isIsoCurrencyCode(currency)) {
    try {
      const formatted = new Intl.NumberFormat(getUserLocale(), {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: fractionSize,
      }).format(absoluteValue);
      return sign ? `${sign}${formatted}` : formatted;
    } catch {
      // Fall back to manual formatting if currency code is invalid
    }
  }

  // Legacy behavior for symbols (€, £, $) or invalid codes
  return `${sign}${currency || ''} ${new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionSize,
  }).format(absoluteValue)}`;
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

// Get currency symbol for display in shortened format
const getCurrencySymbol = (currency: string): string => {
  if (!currency) return '';
  if (!isIsoCurrencyCode(currency)) return currency;

  try {
    // Extract symbol from a formatted currency string
    const formatted = new Intl.NumberFormat(getUserLocale(), {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol',
    }).format(0);
    // Remove the number part to get just the symbol
    return formatted.replace(/[\d\s.,]+/g, '').trim();
  } catch {
    return currency;
  }
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

  const currency = ENV.plugins.WALDUR_CORE.CURRENCY_NAME;

  if (shorten && Number(value) >= 1000) {
    const formattedValue = abbreviateNumber(value);
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${formattedValue}`;
  }
  return formatCurrency(value, currency, fractionSize, signed);
};
