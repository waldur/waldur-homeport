import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { describe, expect, it, vi } from 'vitest';

import { fetchOrderPeriodUsage } from '@/marketplace/common/orderPeriodTotals';
import { renderWithProviders } from '@/test/harness';

import { ResourceComponents } from './ResourceComponents';
import { ResourceComponentsDialog } from './ResourceComponentsDialog';

vi.mock('@/marketplace/common/orderPeriodTotals', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('@/marketplace/common/orderPeriodTotals')
  >()),
  fetchOrderPeriodUsage: vi.fn(),
}));

const component = (type: string, name: string) =>
  ({
    type,
    name,
    billing_type: 'usage',
    measured_unit: 'EUR',
    factor: null,
  }) as any;

const status = (overrides: Record<string, unknown> = {}) => ({
  component_type: 'credit',
  period: 'month' as const,
  used: 5,
  limit: 40,
  reached: false,
  resets_at: DateTime.utc().plus({ days: 3 }).toISO(),
  last_reported_at: DateTime.utc().toISO(),
  ...overrides,
});

const resource = (overrides: Record<string, unknown> = {}) =>
  ({
    name: 'Resource',
    current_usages: { credit: 5 },
    limits: {},
    limit_usage: {},
    spending_limit_status: [status()],
    ...overrides,
  }) as any;

describe('ResourceComponents', () => {
  // Two entries or fewer take the larger layout, which has no help icon.
  it('says when a limit resets in the larger layout', () => {
    renderWithProviders(
      <ResourceComponents
        resource={resource()}
        components={[component('credit', 'Credit')]}
      />,
    );
    expect(screen.getByText(/Credit · Monthly limit/)).toBeInTheDocument();
    expect(screen.getByText('Resets:')).toBeInTheDocument();
    expect(screen.getByText(/^in \d+ days, on .+/)).toBeInTheDocument();
  });

  it('says an all-time limit never resets in the larger layout', () => {
    renderWithProviders(
      <ResourceComponents
        resource={resource({
          spending_limit_status: [status({ period: 'total', resets_at: null })],
        })}
        components={[component('credit', 'Credit')]}
      />,
    );
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('keeps the limit of the component itself beside a month limit', () => {
    renderWithProviders(
      <ResourceComponents
        resource={resource({ limits: { credit: 100 } })}
        components={[component('credit', 'Credit')]}
      />,
    );
    expect(screen.getByText(/5 \/ 100/)).toBeInTheDocument();
    expect(screen.getByText(/5 \/ 40/)).toBeInTheDocument();
  });

  // The help icon must stay visible when a long title is cut off.
  it('puts the help icon beside the title, outside the cut-off text', () => {
    renderWithProviders(
      <ResourceComponents
        resource={resource({
          current_usages: { credit: 5, storage: 1 },
          spending_limit_status: [
            status({ period: 'day', used: 1, limit: 3 }),
            status({ period: 'week', used: 2, limit: 10 }),
          ],
        })}
        components={[
          component('credit', 'Credit'),
          component('storage', 'Storage'),
        ]}
      />,
    );
    const title = screen.getByText('Credit · Weekly limit');
    expect(title).toHaveClass('ellipsis');
    // One help icon per entry: this month, daily, weekly and storage.
    const helpIcons = screen.getAllByRole('button', { name: 'Help' });
    expect(helpIcons).toHaveLength(4);
    helpIcons.forEach((help) => expect(title).not.toContainElement(help));
  });

  it('shows no usage this month while only an earlier month is reported', () => {
    renderWithProviders(
      <ResourceComponents
        resource={resource({
          current_usages: { credit: 480, storage: 1 },
          spending_limit_status: [
            status({
              period: 'total',
              used: 480,
              limit: 1000,
              resets_at: null,
              last_reported_at: DateTime.utc()
                .startOf('month')
                .minus({ days: 5 })
                .toISO(),
            }),
          ],
        })}
        components={[
          component('credit', 'Credit'),
          component('storage', 'Storage'),
        ]}
      />,
    );
    expect(screen.getByText('Credit · This month')).toBeInTheDocument();
    expect(screen.getByText('0 EUR')).toBeInTheDocument();
    // Last month's figure shows only as the all-time limit's usage.
    expect(screen.queryByText('480 EUR')).not.toBeInTheDocument();
    expect(screen.getByText('480/1,000 EUR')).toBeInTheDocument();
  });
});

describe('ResourceComponents order period', () => {
  const cpu = {
    type: 'cpu',
    name: 'CPU',
    billing_type: 'limit',
    limit_period: 'month',
    measured_unit: 'Hours',
    factor: null,
  } as any;
  const limitResource = (overrides: Record<string, unknown> = {}) =>
    ({
      uuid: 'r1',
      name: 'Resource',
      created: '2026-07-01T09:00:00Z',
      end_date: '2027-06-30',
      offering_plugin_options: { show_order_period_totals: true },
      current_usages: { cpu: 1740 },
      limits: { cpu: 5000 },
      limit_usage: { cpu: 1740 },
      ...overrides,
    }) as any;

  it('has no switch unless the offering turns it on', () => {
    renderWithProviders(
      <ResourceComponents
        resource={limitResource({ offering_plugin_options: {} })}
        components={[cpu]}
      />,
    );
    expect(screen.queryByText('Whole order')).not.toBeInTheDocument();
  });

  it('has no switch without an end date', () => {
    renderWithProviders(
      <ResourceComponents
        resource={limitResource({ end_date: null })}
        components={[cpu]}
      />,
    );
    expect(screen.queryByText('Whole order')).not.toBeInTheDocument();
  });

  it('shows the current period first and fetches the order only on demand', () => {
    renderWithProviders(
      <ResourceComponents resource={limitResource()} components={[cpu]} />,
    );
    expect(screen.getByText('Current period')).toBeInTheDocument();
    expect(screen.getByText('Whole order')).toBeInTheDocument();
    expect(screen.getByText(/1,?740/)).toBeInTheDocument();
    expect(fetchOrderPeriodUsage).not.toHaveBeenCalled();
  });

  it('shows the order usage against the limit times the months', async () => {
    vi.mocked(fetchOrderPeriodUsage).mockResolvedValue([
      { type: 'cpu', usage: 8840 },
    ]);
    renderWithProviders(
      <ResourceComponents resource={limitResource()} components={[cpu]} />,
    );
    await userEvent.setup().click(screen.getByText('Whole order'));

    expect(await screen.findByText(/8,?840/)).toBeInTheDocument();
    expect(screen.getByText(/60,?000/)).toBeInTheDocument();
    expect(screen.getAllByText(/2026 – .*2027/).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/monthly limit × 12 months/).length,
    ).toBeGreaterThan(0);
    expect(fetchOrderPeriodUsage).toHaveBeenCalledWith('r1', false);
  });

  it('has no switch for an OpenStack tenant', () => {
    renderWithProviders(
      <ResourceComponents
        resource={limitResource({ offering_type: 'OpenStack.Tenant' })}
        components={[cpu]}
      />,
    );
    expect(screen.queryByText('Whole order')).not.toBeInTheDocument();
  });

  it('shows the order total, not this month, for a component with spending limits', async () => {
    vi.mocked(fetchOrderPeriodUsage).mockResolvedValue([
      { type: 'cpu', usage: 8840 },
    ]);
    renderWithProviders(
      <ResourceComponents
        resource={limitResource({
          spending_limit_status: [
            status({ component_type: 'cpu', period: 'quarter', used: 77 }),
          ],
        })}
        components={[cpu]}
      />,
    );
    expect(screen.getByText(/CPU · This month/)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByText('Whole order'));

    expect(await screen.findByText(/8,?840/)).toBeInTheDocument();
    expect(screen.queryByText(/CPU · This month/)).not.toBeInTheDocument();
  });

  it('keeps the usual label on a component the backend did not total', async () => {
    vi.mocked(fetchOrderPeriodUsage).mockResolvedValue([]);
    renderWithProviders(
      <ResourceComponents resource={limitResource()} components={[cpu]} />,
    );
    await userEvent.setup().click(screen.getByText('Whole order'));

    expect(await screen.findByText(/1,?740/)).toBeInTheDocument();
    expect(screen.getByText(/5,?000/)).toBeInTheDocument();
    expect(screen.queryByText(/monthly limit ×/)).not.toBeInTheDocument();
  });

  it('asks the provider route in the provider view', async () => {
    vi.mocked(fetchOrderPeriodUsage).mockResolvedValue([
      { type: 'cpu', usage: 8840 },
    ]);
    renderWithProviders(
      <ResourceComponents
        resource={limitResource()}
        components={[cpu]}
        providerView
      />,
    );
    await userEvent.setup().click(screen.getByText('Whole order'));

    expect(await screen.findByText(/8,?840/)).toBeInTheDocument();
    expect(fetchOrderPeriodUsage).toHaveBeenCalledWith('r1', true);
  });

  it('keeps a failure to load the order totals inline', async () => {
    vi.mocked(fetchOrderPeriodUsage).mockRejectedValue(new Error('404'));
    renderWithProviders(
      <ResourceComponents resource={limitResource()} components={[cpu]} />,
    );
    await userEvent.setup().click(screen.getByText('Whole order'));

    expect(
      await screen.findByText('Unable to load usage for the whole order.'),
    ).toBeInTheDocument();
  });

  it('names the order period visibly in the grid layout too', async () => {
    // With three or more components the cards carry the period only in
    // their tooltip.
    const gpu = { ...cpu, type: 'gpu', name: 'GPU' };
    const ram = { ...cpu, type: 'ram', name: 'RAM' };
    vi.mocked(fetchOrderPeriodUsage).mockResolvedValue([
      { type: 'cpu', usage: 8840 },
      { type: 'gpu', usage: 10 },
      { type: 'ram', usage: 20 },
    ]);
    renderWithProviders(
      <ResourceComponents
        resource={limitResource({
          limits: { cpu: 5000, gpu: 10, ram: 10 },
          limit_usage: { cpu: 1740, gpu: 1, ram: 2 },
        })}
        components={[cpu, gpu, ram]}
      />,
    );
    await userEvent.setup().click(screen.getByText('Whole order'));

    expect(
      await screen.findByText(/2026 – .*2027 · monthly limit × 12 months/),
    ).toBeInTheDocument();
  });
});

describe('ResourceComponentsDialog order period', () => {
  const cpu = {
    type: 'cpu',
    name: 'CPU',
    billing_type: 'limit',
    limit_period: 'month',
    measured_unit: 'Hours',
    factor: null,
  } as any;

  it('shows the whole-order figures it is opened with', () => {
    renderWithProviders(
      <ResourceComponentsDialog
        resolve={{
          resource: {
            name: 'Resource',
            current_usages: {},
            limits: { cpu: 60000 },
            limit_usage: { cpu: 8840 },
          } as any,
          components: [cpu],
          orderTypes: ['cpu'],
          orderPeriod: 'Jul 2026 – Jun 2027',
          orderPeriodHint: 'monthly limit × 12 months',
        }}
      />,
    );
    expect(screen.getByText(/8,?840/)).toBeInTheDocument();
    expect(screen.getByText(/60,?000/)).toBeInTheDocument();
    expect(screen.getAllByText(/Jul 2026 – Jun 2027/).length).toBeGreaterThan(
      0,
    );
  });
});
