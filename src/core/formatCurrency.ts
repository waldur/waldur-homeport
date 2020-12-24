import { ENV } from '@waldur/configs/default';

export const formatCurrency = (
  value: string | number,
  currency: string,
  fractionSize: number,
) => {
  if (typeof value === 'string') value = parseFloat(value);
  return `${currency}${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionSize,
  }).format(value)}`;
};

export const defaultCurrency = (value) => {
  if (value === undefined || value === null) {
    return value;
  }
  let fractionSize = 2;
  if (value !== 0 && Math.abs(value) < 0.01) {
    fractionSize = 3;
  }
  if (value !== 0 && Math.abs(value) < 0.001) {
    fractionSize = 4;
  }
  return formatCurrency(value, ENV.currency, fractionSize);
};
