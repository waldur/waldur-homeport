import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EChart } from '@/core/EChart';

import { OfferingCostsChart } from './offering-costs/OfferingCostsChart';
import { OrdersDailyCostChart } from './orders/OrdersDailyCostChart';
import { ResourceLimitsHistoryChart } from './project-detail/ResourceLimitsHistoryChart';
import { ResourceUsageHistoryChart } from './project-detail/ResourceUsageHistoryChart';
import { ProviderRevenueChart } from './provider/ProviderRevenueChart';
import { TopOfferingsByRevenueChart } from './provider/TopOfferingsByRevenueChart';
import { ProvisioningTrendChart } from './provisioning-stats/ProvisioningTrendChart';
import { RoleDistributionChart } from './user-roles/RoleDistributionChart';
import { AffiliationsChart } from './users/charts/AffiliationsChart';

vi.mock('@/core/ChartCard', () => ({
  ChartCard: ({ children }) => children({ current: null }),
}));
vi.mock('@/table/useTable', () => ({ useTable: () => ({}) }));
vi.mock('@/table/Table', () => ({ default: () => null }));

// Organisation, offering, component and affiliation names come from users and
// providers. ECharts inserts a tooltip formatter's result as HTML.
const NAME = '<img src=x onerror=alert(1)>';
const ESCAPED = '&lt;img src=x onerror=alert(1)&gt;';

// The global EChart mock (test/mocks/echarts.js) is a vi.fn: read the options
// the chart was last drawn with, skipping any call that came without props.
const lastOptions = () =>
  vi
    .mocked(EChart)
    .mock.calls.filter(([props]) => props)
    .at(-1)?.[0].options;

const tooltipOf = (element: JSX.Element) => {
  vi.mocked(EChart).mockClear();
  render(element);
  return lastOptions().tooltip.formatter;
};

const expectEscaped = (html: string) => {
  expect(html).toContain(ESCAPED);
  expect(html).not.toContain('<img');
};

describe('reporting chart tooltips escape names', () => {
  it.each([
    [
      'RoleDistributionChart',
      <RoleDistributionChart
        key="roles"
        data={[{ name: NAME, abbreviation: '', count: 1 } as any]}
      />,
    ],
    [
      'TopOfferingsByRevenueChart',
      <TopOfferingsByRevenueChart
        key="offerings"
        offerings={[{ offering_uuid: 'o', offering_name: NAME, revenue: 1 }]}
      />,
    ],
    [
      'OrdersDailyCostChart',
      <OrdersDailyCostChart
        key="orders"
        dailyStats={[{ date: '2026-01-01', total_cost: '1' } as any]}
      />,
    ],
    [
      'ProviderRevenueChart',
      <ProviderRevenueChart
        key="revenue"
        data={[{ year: 2026, month: 1, total: 1 } as any]}
      />,
    ],
    [
      'OfferingCostsChart',
      <OfferingCostsChart
        key="costs"
        data={[{ offering_name: NAME, cost: 1 } as any]}
      />,
    ],
    [
      'AffiliationsChart',
      <AffiliationsChart
        key="affiliations"
        data={[{ affiliation: `member@${NAME}`, count: 1 } as any]}
        refetch={vi.fn()}
      />,
    ],
  ])('%s', (_, element) => {
    const formatter = tooltipOf(element);
    expectEscaped(formatter([{ name: NAME, value: 1 }]));
  });

  it('ResourceUsageHistoryChart', () => {
    const formatter = tooltipOf(
      <ResourceUsageHistoryChart
        data={[
          { date: '2026-01-01', type: 'cpu', usage: 1, cumulative_usage: 1 },
        ]}
        labelMap={{ cpu: NAME }}
      />,
    );
    expectEscaped(
      formatter([{ value: ['2026-01-01', 1], seriesName: NAME, marker: '' }]),
    );
  });

  it('ResourceLimitsHistoryChart', () => {
    const formatter = tooltipOf(
      <ResourceLimitsHistoryChart
        data={[{ date: '2026-01-01', limit_name: 'cpu', limit_value: 1 }]}
        labelMap={{ cpu: NAME }}
      />,
    );
    expectEscaped(
      formatter([{ value: ['2026-01-01', 1], seriesName: NAME, marker: '' }]),
    );
  });

  it('ProvisioningTrendChart', () => {
    const formatter = tooltipOf(
      <ProvisioningTrendChart
        daily={[{ date: NAME, total: 1, by_state: {} } as any]}
      />,
    );
    expectEscaped(formatter([{ dataIndex: 0 }]));
  });
});
