import { useQuery } from '@tanstack/react-query';
import { getDateLocale, translate } from 'waldur-i18n-runtime';
import { SpendingLimitPeriodEnum } from 'waldur-js-client';
import { fetchRuntimeConfig } from 'waldur-runtime-config';

import { QUERY_KEY } from './queries';

/** The deployment's currency, as the portal shows prices. */
const useCurrency = () =>
  useQuery({
    queryKey: [QUERY_KEY, 'currency'],
    queryFn: async () => {
      const config = await fetchRuntimeConfig();
      return (config.plugins?.WALDUR_CORE?.CURRENCY_NAME as string) || 'EUR';
    },
    staleTime: Infinity,
  }).data;

export const useFormatMoney = () => {
  const currency = useCurrency();
  return (amount?: number | string | null) => {
    if (amount == null || amount === '') {
      return undefined;
    }
    const value = Number(amount);
    if (Number.isNaN(value)) {
      return undefined;
    }
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency ?? 'EUR',
      }).format(value);
    } catch {
      // A currency name that is not an ISO code: show it after the amount.
      return `${value.toFixed(2)} ${currency}`;
    }
  };
};

/** "Today", "This month": the window a spending limit counts in. */
export const periodLabel = (period: SpendingLimitPeriodEnum) =>
  ({
    day: translate('Today'),
    week: translate('This week'),
    month: translate('This month'),
    quarter: translate('This quarter'),
    year: translate('This year'),
    total: translate('In total'),
  })[period] ?? period;

/** "18.6 M" for a token count. */
export const formatTokens = (count?: number | null) => {
  if (count == null) return undefined;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)} M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)} k`;
  return String(count);
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A date-only string is that day where the reader is; `new Date` would
 * read it as UTC midnight, the day before anywhere west of UTC. */
const parseDay = (iso: string) => {
  const day = DATE_ONLY.exec(iso);
  return day
    ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]))
    : new Date(iso);
};

/** "30 Nov": a day near enough to need no year or time, in the app's date
 * locale (not the browser's). */
export const formatDay = (iso?: string | null) =>
  iso
    ? parseDay(iso).toLocaleDateString(getDateLocale(), {
        day: 'numeric',
        month: 'short',
      })
    : undefined;
