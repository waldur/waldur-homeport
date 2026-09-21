import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_PRIMARY_COLORS } from 'waldur-design-tokens';

import {
  formatAcceptedTrendChart,
  formatConsentStatusChart,
  formatVersionAdoptionChart,
} from './utils';

const root = document.documentElement;

afterEach(() => root.removeAttribute('style'));

describe('consent chart colours', () => {
  it('draws the version bars in the brand 300', () => {
    const options = formatVersionAdoptionChart([]);
    const series = options.series as { itemStyle: { color: string } }[];
    expect(series[0].itemStyle.color).toBe(DEFAULT_PRIMARY_COLORS[300]);
  });

  it('colours the consent pie brand 600, brand 300 and the track', () => {
    root.style.setProperty('--color-gray-200', '#e4e7ec');
    const options = formatConsentStatusChart({
      accepted_consents_count: 1,
      revoked_consents_count: 1,
      total_users_count: 3,
      total_consents_count: 2,
      active_users_count: 1,
    });
    const series = options.series as { color: string[] }[];
    expect(series[0].color).toEqual([
      DEFAULT_PRIMARY_COLORS[600],
      DEFAULT_PRIMARY_COLORS[300],
      '#e4e7ec',
    ]);
  });

  it('draws the accepted trend line in the brand 600', () => {
    const options = formatAcceptedTrendChart([]);
    const series = options.series as {
      itemStyle: { color: string };
      lineStyle: { color: string };
      areaStyle: { color: string };
    }[];
    expect(series[0].itemStyle.color).toBe(DEFAULT_PRIMARY_COLORS[600]);
    expect(series[0].lineStyle.color).toBe(DEFAULT_PRIMARY_COLORS[600]);
    expect(series[0].areaStyle.color).toBe(DEFAULT_PRIMARY_COLORS[600]);
  });
});
