import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceCustomerUsageComponentsUsageByProjectRetrieve,
  marketplaceCustomerUsageComponentsUsageTimeseriesRetrieve,
} from 'waldur-js-client';

import { EChart } from '@/core/EChart';

import { LimitHorizonView } from './LimitHorizonView';
import { PeriodOverPeriodView } from './PeriodOverPeriodView';
import { TreemapView } from './TreemapView';

// Offering, component, project and unit names come from providers and users.
// ECharts inserts a tooltip formatter's result as HTML.
const NAME = '<img src=x onerror=alert(1)>';
const ESCAPED = '&lt;img src=x onerror=alert(1)&gt;';

const component = {
  type: NAME,
  name: NAME,
  description: '',
  measured_unit: NAME,
  billing_type: 'limit',
  usage: 0,
  limit_usage: 140,
  usage_terminated: 0,
  limit_usage_terminated: 40,
  limit: 1000,
  offering_name: NAME,
  offering_uuid: 'abc',
  limit_period: 'quarterly',
  current_period_label: NAME,
  current_period_start: '2026-04-01',
  current_period_end: '2026-06-30',
} as any;

// The global EChart mock (test/mocks/echarts.js) is a vi.fn: read the options
// the chart was last drawn with, skipping any call that came without props.
const lastOptions = () =>
  vi
    .mocked(EChart)
    .mock.calls.filter(([props]) => props)
    .at(-1)?.[0].options;

const renderView = (element: JSX.Element) => {
  vi.mocked(EChart).mockClear();
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {element}
    </QueryClientProvider>,
  );
};

const expectEscaped = (html: string) => {
  expect(html).toContain(ESCAPED);
  expect(html).not.toContain('<img');
};

describe('aggregate usage view tooltips escape names', () => {
  beforeEach(() => {
    vi.mocked(
      marketplaceCustomerUsageComponentsUsageByProjectRetrieve,
    ).mockResolvedValue({
      data: { projects: [{ project_name: NAME, usage: 1, is_removed: true }] },
    } as any);
    vi.mocked(
      marketplaceCustomerUsageComponentsUsageTimeseriesRetrieve,
    ).mockResolvedValue({
      data: {
        buckets: [{ usage: 1 }],
        current_period_label: NAME,
        measured_unit: NAME,
      },
    } as any);
  });

  it('LimitHorizonView: row and per-project names', async () => {
    renderView(
      <LimitHorizonView
        customer={{ uuid: 'customer' } as any}
        components={[component]}
      />,
    );
    // Wait for the per-project split, so its rows are in the tooltip too.
    await waitFor(() =>
      expect(
        lastOptions()
          .tooltip.formatter({ dataIndex: 0 })
          .match(/&lt;img/g),
      ).toHaveLength(8),
    );
    expectEscaped(lastOptions().tooltip.formatter({ dataIndex: 0 }));
  });

  it('PeriodOverPeriodView: series name and unit', async () => {
    renderView(
      <PeriodOverPeriodView
        customer={{ uuid: 'customer' } as any}
        components={[component]}
      />,
    );
    await waitFor(() => expect(lastOptions()).toBeTruthy());
    expectEscaped(
      lastOptions().tooltip.formatter([
        { marker: '', seriesName: NAME, value: 1 },
      ]),
    );
  });

  it('TreemapView: level, label and detail', () => {
    renderView(<TreemapView components={[component]} />);
    const formatter = lastOptions().tooltip.formatter;
    expectEscaped(
      formatter({
        name: NAME,
        value: 1,
        data: { _meta: { level: NAME, label: NAME, detail: NAME } },
      }),
    );
  });
});
