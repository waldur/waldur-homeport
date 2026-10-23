import { screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ResourceComponents } from './ResourceComponents';

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
